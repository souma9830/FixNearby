import QuoteNegotiation from '../models/QuoteNegotiation.js';

class QuoteNegotiationService {
  static async createQuote(payload) {
    const expirationHours = 24;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    const quote = new QuoteNegotiation({
      chatId: payload.chatId,
      customerId: payload.customerId,
      workerId: payload.workerId,
      proposedPrice: payload.proposedPrice,
      originalEstimate: payload.originalEstimate,
      proposedBy: payload.proposedBy,
      customScopeTerms: payload.customScopeTerms,
      expiresAt,
    });

    return await quote.save();
  }

  static async respondToQuote(quoteId, userId, action) {
    const quote = await QuoteNegotiation.findById(quoteId);
    if (!quote) {
      throw new Error('Quote negotiation record not found');
    }

    if (quote.quoteStatus !== 'Pending Counter') {
      throw new Error(`Quote is already ${quote.quoteStatus}`);
    }

    if (new Date() > quote.expiresAt) {
      quote.quoteStatus = 'Expired';
      await quote.save();
      throw new Error('Quote has expired');
    }

    if (action === 'Accept') {
      quote.quoteStatus = 'Accepted';
    } else if (action === 'Decline') {
      quote.quoteStatus = 'Declined';
    } else {
      throw new Error('Invalid response action');
    }

    return await quote.save();
  }

  static async getActiveQuotes(chatId) {
    return await QuoteNegotiation.find({ chatId }).sort({ createdAt: -1 });
  }
}

export default QuoteNegotiationService;
