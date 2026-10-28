import Item from '../models/Item.js';

const MAX_IMPORT_ROWS = 5000;
const MAX_ID_LENGTH = 40;
const MAX_TEXT_LENGTH = 120;

const clean = (value) => (value === undefined || value === null ? '' : String(value).replace(/\s+/g, ' ').trim());
// Same rule the scanner falls back to: "pedia 12" and "PEDIA12" are one pass
const normalizeId = (value) => clean(value).replace(/\s+/g, '').toUpperCase();
const isPlainValue = (value) => value === undefined || value === null || ['string', 'number'].includes(typeof value);

// @desc    Every pass with its entry status, for the Excel download
// @route   GET /api/mrstm/passes
// @access  Admin
export const listPasses = async (req, res) => {
    try {
        const items = await Item.find({}, 'elixirPassId name department batch isSpecial validOn lastScannedAt scannedBy')
            .populate('scannedBy', 'username')
            .lean();
        const passes = items.map(({ _id, scannedBy, ...item }) => ({ ...item, scannedBy: scannedBy?.username || null }));
        res.status(200).json({ count: passes.length, passes });
    } catch (error) {
        console.error('Error listing passes:', error);
        res.status(500).json({ message: 'Server error while loading passes' });
    }
};

const validateRow = (raw, index) => {
    const row = Number.isInteger(raw?.row) ? raw.row : index + 2;
    const fields = ['elixirPassId', 'name', 'department', 'designation'];
    if (!raw || typeof raw !== 'object' || fields.some((f) => !isPlainValue(raw[f]))) {
        return { row, status: 'error', message: 'This row could not be read' };
    }
    const rawId = clean(raw.elixirPassId);
    const entry = {
        row,
        elixirPassId: normalizeId(raw.elixirPassId),
        name: clean(raw.name),
        department: clean(raw.department).toUpperCase(),
        designation: clean(raw.designation).toUpperCase(),
    };
    if (rawId && rawId !== entry.elixirPassId) entry.note = `ID saved as ${entry.elixirPassId} (was "${rawId}")`;

    const problems = [];
    if (!entry.elixirPassId) problems.push('Elixir ID is missing');
    else if (entry.elixirPassId.length > MAX_ID_LENGTH) problems.push(`Elixir ID is longer than ${MAX_ID_LENGTH} characters`);
    if (!entry.name) problems.push('Name is missing');
    if ([entry.name, entry.department, entry.designation].some((v) => v.length > MAX_TEXT_LENGTH)) {
        problems.push(`Text is longer than ${MAX_TEXT_LENGTH} characters`);
    }
    return problems.length ? { ...entry, status: 'error', message: problems.join('; ') } : { ...entry, status: 'new' };
};

// What an update would change; blank Department/Designation cells keep the current value
const diffWithExisting = (entry, doc) => {
    const changes = {};
    if (entry.name !== doc.name) changes.name = entry.name;
    if (entry.department && entry.department !== doc.department) changes.department = entry.department;
    if (entry.designation && entry.designation !== doc.batch) changes.batch = entry.designation;
    return changes;
};

const FIELD_LABELS = { name: 'Name', department: 'Department', batch: 'Designation' };

// @desc    Check (dryRun) or import passes read from an Excel/CSV upload
// @route   POST /api/mrstm/passes/import
// @access  Admin
export const importPasses = async (req, res) => {
    const { rows, mode = 'skip', dryRun = true } = req.body || {};

    if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: 'The file has no passes to import.' });
    }
    if (rows.length > MAX_IMPORT_ROWS) {
        return res.status(400).json({ message: `A file can have at most ${MAX_IMPORT_ROWS} passes. Split it into smaller files.` });
    }
    if (!['skip', 'update'].includes(mode)) {
        return res.status(400).json({ message: 'mode must be "skip" or "update"' });
    }

    try {
        const results = rows.map(validateRow);

        // The same ID twice in one file is ambiguous, so none of those rows are imported
        const rowsById = new Map();
        for (const r of results) {
            if (r.status !== 'error') rowsById.set(r.elixirPassId, [...(rowsById.get(r.elixirPassId) || []), r]);
        }
        for (const [id, dupes] of rowsById) {
            if (dupes.length < 2) continue;
            for (const r of dupes) {
                r.status = 'error';
                r.message = `Elixir ID ${id} is on rows ${dupes.map((d) => d.row).join(', ')}`;
            }
            rowsById.delete(id);
        }

        const existing = new Map(
            (await Item.find({ elixirPassId: { $in: [...rowsById.keys()] } }, 'elixirPassId name department batch').lean())
                .map((doc) => [doc.elixirPassId, doc])
        );
        for (const r of results) {
            const doc = r.status === 'new' && existing.get(r.elixirPassId);
            if (!doc) continue;
            if (mode === 'skip') {
                r.status = 'skip';
                r.message = `Already exists as "${doc.name}"`;
                continue;
            }
            const changes = diffWithExisting(r, doc);
            r.changes = changes;
            if (Object.keys(changes).length === 0) {
                r.status = 'unchanged';
                r.message = 'Already up to date';
            } else {
                r.status = 'update';
                r.message = Object.keys(changes)
                    .map((field) => `${FIELD_LABELS[field]}: "${doc[field] || ''}" → "${changes[field]}"`)
                    .join('; ');
            }
        }

        const summary = { total: results.length, new: 0, update: 0, unchanged: 0, skip: 0, error: 0 };
        for (const r of results) summary[r.status] += 1;

        if (dryRun) {
            return res.status(200).json({ dryRun: true, mode, summary, rows: results });
        }

        const ops = [];
        for (const r of results) {
            if (r.status === 'new') {
                const doc = { elixirPassId: r.elixirPassId, name: r.name, isSpecial: false };
                if (r.department) doc.department = r.department;
                if (r.designation) doc.batch = r.designation;
                // $setOnInsert: if someone created this ID a moment ago, theirs is kept
                ops.push({ updateOne: { filter: { elixirPassId: r.elixirPassId }, update: { $setOnInsert: doc }, upsert: true } });
            } else if (r.status === 'update') {
                ops.push({ updateOne: { filter: { elixirPassId: r.elixirPassId }, update: { $set: r.changes } } });
            }
        }
        const result = ops.length ? await Item.bulkWrite(ops, { ordered: false }) : null;
        const added = result?.upsertedCount || 0;
        const updated = result?.modifiedCount || 0;
        const notImported = summary.error ? ` ${summary.error} row${summary.error > 1 ? 's' : ''} with problems ${summary.error > 1 ? 'were' : 'was'} not imported.` : '';

        res.status(200).json({
            dryRun: false,
            mode,
            message: `Import finished: ${added} new pass${added === 1 ? '' : 'es'} added, ${updated} updated.${notImported}`,
            summary: { ...summary, added, updated },
            importedIds: results.filter((r) => r.status === 'new' || r.status === 'update').map((r) => r.elixirPassId),
            rows: results.filter((r) => r.status === 'error'),
        });
    } catch (error) {
        console.error('Error importing passes:', error);
        res.status(500).json({ message: 'Server error while importing passes. Some passes may have been saved; upload the file again to see which.' });
    }
};
