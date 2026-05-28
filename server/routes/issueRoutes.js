import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getNearbyIssues,
  createIssue,
  upvoteIssue,
  getIssueById,
  updateIssueStatus
} from '../controllers/issueController.js';

const router = express.Router();

// Setup multer storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2,8)}${ext}`);
  }
});

const upload = multer({ storage });

// GET /nearby
router.get('/nearby', getNearbyIssues);

// POST / (create issue) - supports optional image
router.post('/', upload.single('image'), createIssue);

// POST /:id/upvote
router.post('/:id/upvote', upvoteIssue);

// GET /:id
router.get('/:id', getIssueById);

router.patch('/:id/status', updateIssueStatus);

export default router;
