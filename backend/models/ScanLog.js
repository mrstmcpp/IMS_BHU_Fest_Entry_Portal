import mongoose from 'mongoose';

// One document per scan attempt, so admins can see who scanned how many people and who was let in.
const scanLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: {
        type: String,
    },
    elixirPassId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    result: {
        type: String,
        enum: ['entered', 'already_scanned', 'not_found', 'wrong_day'],
        required: true,
    },
}, { timestamps: { createdAt: true, updatedAt: false } });

scanLogSchema.index({ user: 1, createdAt: -1 });
scanLogSchema.index({ createdAt: -1 });

const ScanLog = mongoose.model('ScanLog', scanLogSchema);

export default ScanLog;
