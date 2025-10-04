import express from 'express';
import { registerUser } from '../controllers/secretController.js';
import { freeEntry, freeAllEntries , freeMultipleEntries } from '../controllers/scanningController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/secretRegister', protect, admin, registerUser);
router.post('/freeEntry', protect, admin, freeEntry);
router.get('/freeAllEntries', protect, admin, freeAllEntries);
router.post('/freeMultipleEntries', protect, admin, freeMultipleEntries);

export default router;
