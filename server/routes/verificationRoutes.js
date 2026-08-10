import express from 'express';
import { protect, protectWorker, adminOnly, requireRole } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  submitVerification,
  getVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationStats,
  uploadDocument
} from '../controllers/verificationController.js';

const router = express.Router();

// Worker submits verification documents
router.post(
  '/submit',
  protectWorker,
  requireRole('provider', 'worker', 'admin'),
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'selfieWithId', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'professionalLicense', maxCount: 1 },
    { name: 'insuranceProof', maxCount: 1 }
  ]),
  submitVerification
);

// Worker checks their own verification status
router.get('/status', protectWorker, requireRole('provider', 'worker', 'admin'), getVerificationStatus);

// Admin: list pending verifications
router.get('/pending', protect, adminOnly, getPendingVerifications);

// Admin: get stats
router.get('/stats', protect, adminOnly, getVerificationStats);

// Admin: approve / reject
router.patch('/:id/approve', protect, adminOnly, approveVerification);
router.patch('/:id/reject', protect, adminOnly, rejectVerification);

// Worker: upload a single document
router.post('/upload', protectWorker, requireRole('provider', 'worker', 'admin'), upload.single('document'), uploadDocument);

export default router;
