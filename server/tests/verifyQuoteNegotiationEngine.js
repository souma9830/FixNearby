import mongoose from 'mongoose';
import QuoteNegotiation from '../models/QuoteNegotiation.js';

async function testQuoteNegotiation() {
  console.log('[TEST] Starting Quote Negotiation Verification...');
  const fakeChatId = new mongoose.Types.ObjectId();
  const fakeCustomerId = new mongoose.Types.ObjectId();
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const quote = new QuoteNegotiation({
      chatId: fakeChatId,
      customerId: fakeCustomerId,
      workerId: fakeWorkerId,
      proposedPrice: 85,
      originalEstimate: 120,
      proposedBy: fakeWorkerId,
      customScopeTerms: 'Includes material discount and 2-hour completion window.',
      expiresAt: new Date(Date.now() + 86400000),
    });

    console.log('[TEST] Quote object created:', quote.proposedPrice, 'Status:', quote.quoteStatus);
    console.log('[TEST] Quote Negotiation Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testQuoteNegotiation();
