import express from 'express';
import * as skillController from '../controllers/skillCertificationController.js';
import { validateSkillCertificationPayload } from '../middleware/skillValidationMiddleware.js';

const router = express.Router();

router.post('/', validateSkillCertificationPayload, skillController.addSkill);
router.get('/worker/:workerId', skillController.getSkills);
router.post('/audit-expired', skillController.auditExpired);
router.delete('/:skillId', skillController.deleteSkill);

export default router;
