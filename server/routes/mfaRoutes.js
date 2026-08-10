import express from 'express';
import { setupMfa, enableMfa, disableMfa, verifyMfaChallenge } from '../controllers/mfaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/setup', setupMfa);
router.post('/enable', enableMfa);
router.post('/disable', disableMfa);
router.post('/verify-challenge', verifyMfaChallenge);

export default router;
