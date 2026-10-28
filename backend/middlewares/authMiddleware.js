import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// How often a user's lastActiveAt is refreshed at most (keeps writes low during busy scanning)
const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user no longer exists' });
            }
            const now = new Date();
            if (!req.user.lastActiveAt || now - req.user.lastActiveAt > ACTIVITY_WRITE_INTERVAL_MS) {
                await User.updateOne({ _id: req.user._id }, { $set: { lastActiveAt: now } });
                req.user.lastActiveAt = now;
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};
