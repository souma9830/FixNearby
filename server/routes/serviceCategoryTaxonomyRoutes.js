const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/serviceCategoryTaxonomyController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/create', protect, adminOnly, taxonomyController.createTaxonomyCategory);
router.get('/tree', taxonomyController.getTaxonomyTree);

module.exports = router;
