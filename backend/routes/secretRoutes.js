import express from 'express';
import { registerUser } from '../controllers/secretController.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/secretRegister', registerUser);

export default router;
