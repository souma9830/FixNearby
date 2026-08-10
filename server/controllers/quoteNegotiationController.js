import QuoteNegotiationService from '../services/quoteNegotiationService.js';

export const createQuote = async (req, res) => {
  try {
    const proposedBy = req.user ? req.user.id : req.body.proposedBy;
    const quote = await QuoteNegotiationService.createQuote({
      ...req.body,
      proposedBy,
    });
    return res.status(201).json({
      success: true,
      message: 'Custom quote counter-offer submitted.',
      data: quote,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const respondQuote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    const { action } = req.body;
    const updated = await QuoteNegotiationService.respondToQuote(req.params.quoteId, userId, action);
    return res.status(200).json({
      success: true,
      message: `Quote ${action.toLowerCase()}ed successfully.`,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQuotes = async (req, res) => {
  try {
    const quotes = await QuoteNegotiationService.getActiveQuotes(req.params.chatId);
    return res.status(200).json({
      success: true,
      data: quotes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const expirePendingQuotes = async (req, res) => {
  try {
    const { chatId } = req.params;
    const quotes = await QuoteNegotiationService.getActiveQuotes(chatId);
    let expiredCount = 0;

    for (const q of quotes) {
      if (q.status === 'proposed' || q.status === 'countered') {
        const hoursPassed = (Date.now() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursPassed > 24) {
          await QuoteNegotiationService.respondToQuote(q._id || q.id, 'system', 'reject');
          expiredCount++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      chatId,
      expiredCount,
      message: `Expired ${expiredCount} stale quote counter-offers.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
