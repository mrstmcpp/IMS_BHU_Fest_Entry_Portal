import Item from '../models/Item.js';

export const processScan = async (req, res) => {
    const { elixirPassId } = req.body; 
    // console.log("Received scan request for ID:", elixirPassId);
    if (!elixirPassId) {
        return res.status(400).json({ message: 'Elixir Pass ID is required' });
    }

    try {
        const item = await Item.findOne({ elixirPassId });

        if (!item) {
            return res.status(404).json({ message: `Item with ID "${elixirPassId}" not found.` });
        }

        // Check if it has been scanned before
        if (item.lastScannedAt) {
            return res.status(409).json({ 
                message: `This item was already scanned on ${new Date(item.lastScannedAt).toLocaleString()}`,
                item: {
                    elixirPassId: item.elixirPassId,
                    name: item.name,
                    department: item.department,
                    batch: item.batch,
                    
                }
            });
        }
        

        item.lastScannedAt = new Date();
        await item.save();

        res.status(200).json({
            message: 'Entry successful!, Welcome to the Fest.',
            item,
        });

    } catch (error) {
        console.error("Scan processing error:", error);
        res.status(500).json({ message: 'Server error during scan processing' });
    }
};



export const createNewPass = async (req , res) => {
    const { elixirPassId, name, department, batch } = req.body;

    if (!elixirPassId || !name || !department || !batch) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const existingItem = await Item.findOne({ elixirPassId });
        if (existingItem) {
            return res.status(409).json({ message: 'Elixir Pass ID already exists' });
        }
        const qrCodeData = "https://quickchart.io/qr?text=" + encodeURIComponent(elixirPassId);

        const newItem = await Item.create({ name , department , batch , elixirPassId });
        res.status(201).json({ message: 'New Elixir Pass created successfully', item: newItem , qrCodeData });
    } catch (error) {
        console.error("Error creating new Elixir Pass:", error);
        res.status(500).json({ message: 'Server error during Elixir Pass creation' });
    }

}


export const getScanCount = async (req, res) => {
    try {
        const count = await Item.countDocuments({ lastScannedAt: { $ne: null } });
        const total = await Item.countDocuments();
        res.status(200).json({ count, total });
    } catch (error) {
        console.error('Error getting scan count:', error);
        res.status(500).json({ message: 'Server error while fetching scan count.' });
    }
};



export const freeEntry = async (req, res) => {
    const { elixirPassId } = req.body;

    if (!elixirPassId) {
        return res.status(400).json({ message: 'Elixir Pass ID is required' });
    }

    try {
        const item = await Item.findOne({ elixirPassId });

        if (!item) {
            return res.status(404).json({ message: `Item with ID "${elixirPassId}" not found.` });
        }

        if (!item.lastScannedAt) {
            return res.status(409).json({
                message: 'This item is not scanned yet, no need to free.',
                item: {
                    elixirPassId: item.elixirPassId,
                    name: item.name,
                    department: item.department,
                    batch: item.batch,
                }
            });
        }

        // Reset scan
        item.lastScannedAt = null;
        await item.save();

        res.status(200).json({
            message: `Entry for ID "${elixirPassId}" has been freed (scan reset).`,
            item: {
                elixirPassId: item.elixirPassId,
                name: item.name,
                department: item.department,
                batch: item.batch,
                lastScannedAt: item.lastScannedAt,
            }
        });
    } catch (error) {
        console.error("Error freeing entry:", error);
        res.status(500).json({ message: 'Server error while freeing entry.' });
    }
};


const SECRET_CODE = process.env.FREE_ALL_SECRET || "MRSTMMUSIC"; // store secret in .env

export const freeAllEntries = async (req, res) => {
    const { secretCode } = req.body;

    if (!secretCode || secretCode !== SECRET_CODE) {
        return res.status(401).json({ message: "Unauthorized: invalid secret code" });
    }

    try {
        const result = await Item.updateMany(
            { lastScannedAt: { $ne: null } },
            { $set: { lastScannedAt: null } }
        );

        res.status(200).json({
            message: `All scanned entries have been freed.`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error freeing all entries:", error);
        res.status(500).json({ message: 'Server error while freeing all entries.' });
    }
};


export const freeMultipleEntries = async (req, res) => {
    const { elixirPassIds } = req.body;

    if (!elixirPassIds || !Array.isArray(elixirPassIds) || elixirPassIds.length === 0) {
        return res.status(400).json({ message: 'An array of Elixir Pass IDs is required' });
    }

    try {
        const result = await Item.updateMany(
            { elixirPassId: { $in: elixirPassIds }, lastScannedAt: { $ne: null } },
            { $set: { lastScannedAt: null } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "No matching scanned entries found to free." });
        }

        res.status(200).json({
            message: `Freed ${result.modifiedCount} entries successfully.`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error freeing multiple entries:", error);
        res.status(500).json({ message: 'Server error while freeing multiple entries.' });
    }
};