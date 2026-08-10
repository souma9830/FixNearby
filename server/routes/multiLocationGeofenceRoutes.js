const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/multiLocationGeofenceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add-zone', protect, geofenceController.addServiceZone);
router.get('/my-zones', protect, geofenceController.getWorkerZones);

module.exports = router;
