import express from 'express';
import { registerUser } from '../controllers/secretController.js';
import { freeEntry, freeAllEntries , freeMultipleEntries } from '../controllers/scanningController.js';
import { getUserActivity } from '../controllers/adminController.js';
import { importPasses, listPasses } from '../controllers/passesController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/secretRegister', protect, admin, registerUser);
router.post('/freeEntry', protect, admin, freeEntry);
router.post('/freeAllEntries', protect, admin, freeAllEntries);
router.post('/freeMultipleEntries', protect, admin, freeMultipleEntries);
router.get('/activity', protect, admin, getUserActivity);
router.get('/passes', protect, admin, listPasses);
router.post('/passes/import', protect, admin, importPasses);

export default router;
