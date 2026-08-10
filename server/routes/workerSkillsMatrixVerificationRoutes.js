import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getWorkerSkillsMatrix, addSkillCertification } from '../controllers/workerSkillsMatrixVerificationController.js';

const router = express.Router();

router.get('/:workerId', protect, getWorkerSkillsMatrix);
router.post('/:workerId/skills', protect, addSkillCertification);

export default router;
