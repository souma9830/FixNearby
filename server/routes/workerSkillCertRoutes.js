const express = require('express');
const router = express.Router();
const certController = require('../controllers/workerSkillCertController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, certController.submitSkillCert);
router.get('/worker/:workerId', certController.getWorkerSkills);

module.exports = router;
