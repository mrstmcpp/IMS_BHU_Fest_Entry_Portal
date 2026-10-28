import User from '../models/User.js';
import ScanLog from '../models/ScanLog.js';
import { getScanStatsByUser, emptyStats, startOfTodayIST } from '../utils/scanStats.js';

// A user counts as "online" if the app made any request (or heartbeat) within this window
const ONLINE_WINDOW_MS = 3 * 60 * 1000;

// @desc    Who is active right now, and how many people each user scanned / let in
// @route   GET /api/mrstm/activity
export const getUserActivity = async (req, res) => {
    try {
        const now = Date.now();
        const hourAgo = new Date(now - 60 * 60 * 1000);
        const [users, statsByUser, recent, scansLastHour, enteredLastHour] = await Promise.all([
            User.find({}, 'username isAdmin createdAt lastActiveAt lastLoginAt').lean(),
            getScanStatsByUser(),
            ScanLog.find({}, 'username elixirPassId name result createdAt').sort({ createdAt: -1 }).limit(20).lean(),
            ScanLog.countDocuments({ createdAt: { $gte: hourAgo } }),
            ScanLog.countDocuments({ result: 'entered', createdAt: { $gte: hourAgo } }),
        ]);

        const rows = users
            .map((u) => ({
                _id: u._id,
                username: u.username,
                isAdmin: u.isAdmin,
                createdAt: u.createdAt,
                lastActiveAt: u.lastActiveAt || null,
                lastLoginAt: u.lastLoginAt || null,
                online: Boolean(u.lastActiveAt) && now - new Date(u.lastActiveAt).getTime() <= ONLINE_WINDOW_MS,
                stats: statsByUser.get(String(u._id)) || emptyStats(),
            }))
            .sort((a, b) =>
                (b.online - a.online)
                || (b.stats.today.entered - a.stats.today.entered)
                || (b.stats.entered - a.stats.entered)
                || a.username.localeCompare(b.username));

        res.json({
            onlineWindowSeconds: ONLINE_WINDOW_MS / 1000,
            todayStartsAt: startOfTodayIST(),
            summary: {
                totalUsers: rows.length,
                onlineCount: rows.filter((r) => r.online).length,
                scansLastHour,
                enteredLastHour,
                todayScans: rows.reduce((n, r) => n + r.stats.today.scans, 0),
                todayEntered: rows.reduce((n, r) => n + r.stats.today.entered, 0),
            },
            users: rows,
            recent,
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ message: 'Server error while fetching user activity' });
    }
};
