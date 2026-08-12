import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getWorkerSkillsMatrix, addSkillCertification, endorseWorkerSkill } from '../controllers/workerSkillsMatrixVerificationController.js';

const router = express.Router();

router.get('/:workerId', protect, getWorkerSkillsMatrix);
router.post('/:workerId/skills', protect, addSkillCertification);
router.post('/:workerId/endorse', protect, endorseWorkerSkill);

export default router;
