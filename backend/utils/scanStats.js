import ScanLog from '../models/ScanLog.js';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Midnight today in India, as a UTC Date (so "today" counts match the fest's local day)
export const startOfTodayIST = () => {
    const nowIST = new Date(Date.now() + IST_OFFSET_MS);
    return new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()) - IST_OFFSET_MS);
};

const isEntered = { $cond: [{ $eq: ['$result', 'entered'] }, 1, 0] };

// Per-user scan counts: all-time and today, keyed by user id
export const getScanStatsByUser = async (match = {}) => {
    const today = startOfTodayIST();
    const isToday = { $gte: ['$createdAt', today] };
    const rows = await ScanLog.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$user',
                scans: { $sum: 1 },
                entered: { $sum: isEntered },
                todayScans: { $sum: { $cond: [isToday, 1, 0] } },
                todayEntered: { $sum: { $cond: [{ $and: [isToday, { $eq: ['$result', 'entered'] }] }, 1, 0] } },
                lastScanAt: { $max: '$createdAt' },
            },
        },
    ]);
    return new Map(rows.map((r) => [String(r._id), {
        scans: r.scans,
        entered: r.entered,
        rejected: r.scans - r.entered,
        today: { scans: r.todayScans, entered: r.todayEntered },
        lastScanAt: r.lastScanAt,
    }]));
};

export const emptyStats = () => ({ scans: 0, entered: 0, rejected: 0, today: { scans: 0, entered: 0 }, lastScanAt: null });
