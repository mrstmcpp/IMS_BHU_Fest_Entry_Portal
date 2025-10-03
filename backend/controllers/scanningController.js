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



