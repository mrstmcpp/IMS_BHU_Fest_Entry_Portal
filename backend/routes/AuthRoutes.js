import express from 'express';
import { loginUser, getMe, updatePreferences, heartbeat } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.post('/heartbeat', protect, heartbeat);

export default router;
