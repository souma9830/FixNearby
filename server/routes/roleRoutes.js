import express from 'express';
import { getRolePermissions, updateRoleScope } from '../controllers/roleController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/', getRolePermissions);
router.patch('/:roleName/scopes', updateRoleScope);

export default router;
