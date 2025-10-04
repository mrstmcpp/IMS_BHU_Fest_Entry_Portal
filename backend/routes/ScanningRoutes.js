import express from 'express';
import { processScan , createNewPass , getScanCount } from '../controllers/scanningController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Process a QR code scan
// @route   POST /api/scan
// @access  Private
router.post('/', protect, processScan);
router.post('/create', protect, admin, createNewPass);
router.get('/analytics', protect, getScanCount);

export default router;
