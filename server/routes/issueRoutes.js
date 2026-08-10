import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
import {
  getIssues,
  getNearbyIssues,
  createIssue,
  upvoteIssue,
  getIssueById,
  updateIssueStatus,
  createBookingDispute,
  respondToDispute,
  supportReviewDispute
} from '../controllers/issueController.js';
const router = express.Router();

// Guarantee upload directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed image extensions and MIME types for issue thumbnails.
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2,8)}${ext}`);
  }
});

// Reject uploads whose extension or MIME type is not in the allowlist.
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// GET / — list all issues
router.get('/', getIssues);

// GET /nearby
router.get('/nearby', getNearbyIssues);

// POST / (create issue) — supports optional image
router.post('/', upload.single('image'), createIssue);

// POST /:id/upvote — requires authentication so each user can vote at most once
router.post('/:id/upvote', protect, upvoteIssue);

// Dispute routes
router.post('/dispute', protect, createBookingDispute);
router.post('/:id/respond', protect, respondToDispute);
router.patch('/:id/dispute/status', protect, supportReviewDispute);

// GET /:id — issue detail
router.get('/:id', getIssueById);

// PUT & PATCH /:id/status — status update
router.put('/:id/status', updateIssueStatus);
router.patch('/:id/status', updateIssueStatus);

export default router;
