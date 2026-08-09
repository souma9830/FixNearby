const express = require('express');
const router = express.Router();
const disputeEscalationController = require('../controllers/serviceDisputeEscalationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/file', protect, disputeEscalationController.fileDisputeEscalation);
router.get('/my-disputes', protect, disputeEscalationController.getDisputeEscalations);

module.exports = router;
