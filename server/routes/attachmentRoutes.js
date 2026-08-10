import express from 'express';
import { handleUploadAttachment, getAttachmentById } from '../controllers/attachmentController.js';
import { uploadAttachment } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, uploadAttachment.single('attachment'), handleUploadAttachment);
router.get('/:id', protect, getAttachmentById);

export default router;
