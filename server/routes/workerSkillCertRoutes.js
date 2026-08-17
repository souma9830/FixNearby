import express from 'express';
import { submitSkillCert, getWorkerSkills } from '../controllers/workerSkillCertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', protect, submitSkillCert);
router.get('/worker/:workerId', getWorkerSkills);

export default router;