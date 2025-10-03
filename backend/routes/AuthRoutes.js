import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

export default router;
