import express from 'express';
import * as quoteController from '../controllers/quoteNegotiationController.js';
import { validateQuotePayload } from '../middleware/quoteNegotiationValidation.js';

const router = express.Router();

router.post('/', validateQuotePayload, quoteController.createQuote);
router.patch('/:quoteId/respond', quoteController.respondQuote);
router.get('/chat/:chatId', quoteController.getQuotes);
router.post('/expire/:chatId', quoteController.expirePendingQuotes);

export default router;
