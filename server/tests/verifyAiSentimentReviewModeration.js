import assert from 'assert';
import { analyzeToxicity, analyzeSentiment } from '../utils/sentiment.js';

console.log('[Test] Verifying AI Sentiment Review Toxicity Moderation (#883)...');

// 1. Test clean / positive review
const cleanReview = "John did a great and professional job repairing our plumbing leak. Highly recommended!";
const cleanResult = analyzeToxicity(cleanReview);

assert.strictEqual(cleanResult.isToxic, false, 'Clean review must not be flagged as toxic');
assert.strictEqual(cleanResult.score > 0, true, 'Clean positive review score should be > 0');
assert.strictEqual(cleanResult.reason, null, 'Clean review reason should be null');
console.log('✅ PASS: Clean review correctly evaluated as approved/non-toxic!');

// 2. Test toxic / abusive / fraudulent review
const toxicReview = "This worker is a total scammer and tried to steal our money! Worst service ever, fake scam!";
const toxicResult = analyzeToxicity(toxicReview);

assert.strictEqual(toxicResult.isToxic, true, 'Abusive/fraudulent review must be flagged as toxic');
assert.strictEqual(toxicResult.score, -1, 'Toxic review score must be -1');
assert(toxicResult.matchedKeywords.includes('scammer') || toxicResult.matchedKeywords.includes('steal'), 'Matched keywords must identify toxic/fraudulent terms');
assert(toxicResult.reason.includes('Automated AI Moderation'), 'Reason must explain automated AI moderation flag');
console.log('✅ PASS: Abusive/fraudulent review correctly intercepted and flagged for moderation!');

console.log('🎉 AI SENTIMENT REVIEW MODERATION VERIFIED SUCCESSFULLY (#883)!');
