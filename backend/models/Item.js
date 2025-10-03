import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    elixirPassId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    department: {
        type: String,
    },
    batch:{
        type: String,
    },
    lastScannedAt: {
        type: Date,
    }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

export default Item;

