import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { getScanStatsByUser, emptyStats } from '../utils/scanStats.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};



export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            const now = new Date();
            await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: now, lastActiveAt: now } });
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
                isAdmin: user.isAdmin,
                uiVersion: user.uiVersion ?? null,
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error on login' });
    }
};


// @desc    Current user's profile, UI preference and own scan stats
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const stats = await getScanStatsByUser({ user: req.user._id });
        res.json({
            _id: req.user._id,
            username: req.user.username,
            isAdmin: req.user.isAdmin,
            uiVersion: req.user.uiVersion ?? null,
            stats: stats.get(String(req.user._id)) || emptyStats(),
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};


// @desc    Save the user's UI design choice (1 = classic, 2 = new)
// @route   PUT /api/auth/preferences
export const updatePreferences = async (req, res) => {
    const uiVersion = Number(req.body.uiVersion);
    if (![1, 2].includes(uiVersion)) {
        return res.status(400).json({ message: 'uiVersion must be 1 or 2' });
    }
    try {
        await User.updateOne({ _id: req.user._id }, { $set: { uiVersion } });
        res.json({ uiVersion });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ message: 'Server error while saving preferences' });
    }
};


// @desc    Keep-alive while the app is open; `protect` records the activity
// @route   POST /api/auth/heartbeat
export const heartbeat = (req, res) => {
    res.status(204).end();
};
