import Item from '../models/Item.js';

export const processScan = async (req, res) => {
    const { elixirPassId } = req.body;

    if (!elixirPassId) {
        return res.status(400).json({ message: 'Elixir Pass ID is required' });
    }

    try {
        const item = await Item.findOne({ elixirPassId });

        if (!item) {
            return res.status(404).json({ message: `Item with ID "${elixirPassId}" not found.` });
        }


        if (item.isSpecial) {
            const today = new Date();
            const validOn = new Date(item.validOn);


            const isSameDay =
                today.getFullYear() === validOn.getFullYear() &&
                today.getMonth() === validOn.getMonth() &&
                today.getDate() === validOn.getDate();

            if (!isSameDay) {
                const validDateIST = validOn.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
                return res.status(403).json({
                    message: `This special pass is valid only on ${validDateIST}.`,
                    item: {
                        elixirPassId: item.elixirPassId,
                        name: item.name,
                        department: item.department,
                        batch: item.batch,
                        isSpecial: item.isSpecial,
                    },
                });
            }
        }


        if (item.lastScannedAt) {
            const istTime = new Date(item.lastScannedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

            return res.status(409).json({
                message: item.isSpecial
                    ? `This special pass was already used on ${istTime}.`
                    : `This item was already scanned on ${istTime}.`,
                item: {
                    elixirPassId: item.elixirPassId,
                    name: item.name,
                    department: item.department,
                    batch: item.batch,
                    isSpecial: item.isSpecial,
                },
            });
        }

        item.lastScannedAt = new Date();
        await item.save();

        const istTime = new Date(item.lastScannedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const message = item.isSpecial
            ? `Welcome! Special pass validated successfully for today (${istTime}).`
            : 'Entry successful! Welcome to the Fest.';

        res.status(200).json({
            message,
            item: {
                ...item.toObject(),
                lastScannedAt: istTime,
            },
        });

    } catch (error) {
        console.error("Scan processing error:", error);
        res.status(500).json({ message: 'Server error during scan processing' });
    }
};




export const createNewPass = async (req, res) => {
    const { elixirPassId, name, department, batch, isSpecial, validOn } = req.body;

    if (!elixirPassId || !name || !department || !batch) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingItem = await Item.findOne({ elixirPassId });
        if (existingItem) {
            return res.status(409).json({ message: 'Elixir Pass ID already exists' });
        }

        const newItemData = {
            elixirPassId,
            name,
            department,
            batch,
        };

        if (isSpecial) {
            if (!validOn) {
                return res.status(400).json({ message: 'validOn date is required for special passes' });
            }

            const validDate = new Date(validOn);
            if (isNaN(validDate.getTime())) {
                return res.status(400).json({ message: 'Invalid validOn date format' });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            validDate.setHours(0, 0, 0, 0);

            if (validDate < today) {
                return res.status(400).json({ message: 'Special pass cannot be created for past dates' });
            }

            newItemData.isSpecial = true;
            newItemData.validOn = validDate;
        }

        const newItem = await Item.create(newItemData);

        const qrCodeData = `https://quickchart.io/qr?text=${encodeURIComponent(elixirPassId)}`;

        res.status(201).json({
            message: newItem.isSpecial
                ? 'Special Elixir Pass created successfully'
                : 'Regular Elixir Pass created successfully',
            item: newItem,
            qrCodeData,
        });

    } catch (error) {
        console.error("Error creating new Elixir Pass:", error);
        res.status(500).json({ message: 'Server error during Elixir Pass creation' });
    }
};




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


const SECRET_CODE = process.env.FREE_ALL_SECRET;

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


// export const createSpecialPass = async(req , res) => {
//     const {elixirPassId , name, department, batch, validOn} = req.body;

//     if(!elixirPassId || !name || !department || !batch || !validOn){
//         return res.status(400).json({message: 'All fields are required'});
//     }

//     try{
//         const existingPass = await Item.findOne({elixirPassId});
//         if(existingPass){
//             return res.status(409).json({message: 'Elixir Pass ID already exists'});
//         }
        
        
//         const newSpecialPass = await Item.create({elixirPassId, name, department, batch, validOn: new Date(validOn)});
//         const qrCodeData = "https://quickchart.io/qr?text=" + encodeURIComponent(elixirPassId);
//         res.status(201).json({message: 'New Special Pass created successfully', specialPass: newSpecialPass, qrCodeData});
//     }catch(error){
//         console.error("Error creating special pass:", error);
//         res.status(500).json({ message: 'Server error during special pass creation' });
//     }
// }