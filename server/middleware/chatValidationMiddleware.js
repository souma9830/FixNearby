/**
 * Middleware for validating chat message payload parameters
 */
import { sanitizeChatMessagePayload } from '../services/messageRetryService.js';

export const chatMessageValidator = (req, res, next) => {
  const { content, text, message } = req.body || {};
  const msgContent = content || text || message;

  if (req.method === 'POST' && msgContent !== undefined) {
    const clean = sanitizeChatMessagePayload(msgContent);
    if (!clean) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }
    req.sanitizedMessage = clean;
  }

  next();
};
