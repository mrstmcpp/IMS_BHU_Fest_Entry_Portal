import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const username = process.env.SEED_ADMIN_USERNAME;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!username || !password) {
    throw new Error('SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD must be set');
}

try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
        console.log(`Admin user "${username}" already exists; no changes made.`);
    } else {
        await User.create({ username, password, isAdmin: true });
        console.log(`Admin user "${username}" created successfully.`);
    }
} catch (error) {
    console.error('Admin seed failed:', error);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
