const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'perfect', 'helpful', 'professional', 'fast', 'clean', 'awesome', 'friendly', 'recommend', 'superb', 'best'];
const NEGATIVE_WORDS = ['bad', 'poor', 'terrible', 'worst', 'rude', 'late', 'dirty', 'unprofessional', 'slow', 'horrible', 'awful', 'overpriced', 'scam', 'waste'];

/**
 * Analyzes the sentiment of a text block based on keyword match frequencies.
 * Returns a score between -1 and 1 (-1: Negative, 0: Neutral, 1: Positive).
const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'perfect', 'helpful', 'professional', 'fast', 'clean'];
const NEGATIVE_WORDS = ['bad', 'poor', 'terrible', 'worst', 'rude', 'late', 'dirty', 'unprofessional', 'slow'];
const TOXIC_KEYWORDS = [
  'scam', 'scammer', 'fraud', 'fraudulent', 'steal', 'stole', 'thief', 'cheat',
  'cheated', 'abuse', 'abusive', 'hate', 'idiot', 'stupid', 'bribe', 'threat',
  'threatened', 'illegal', 'scammed', 'harass', 'harassment'
];

/**
 * Analyzes the sentiment score of a text block based on keyword frequencies.
 * Returns a score between -1 and 1.
 */
export const analyzeSentiment = (text) => {
  if (typeof text !== 'string' || !text.trim()) {
    return 0;
  }

  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return 0;
  }

  let score = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.includes(word)) score += 1;
    if (NEGATIVE_WORDS.includes(word)) score -= 1;
  }

  if (score > 0) return 1; // Positive
  if (score < 0) return -1; // Negative
  return 0; // Neutral
};

/**
 * AI Toxicity & Fraudulence Detection Analyzer (#883).
 * Intercepts text strings and returns toxicity flag, score, and matched indicators.
 */
export const analyzeToxicity = (text) => {
  if (!text) return { isToxic: false, score: 0, reason: null, matchedKeywords: [] };

  const lower = text.toLowerCase();
  const words = lower.split(/\W+/);
  
  const matchedKeywords = [];
  for (const word of words) {
    if (TOXIC_KEYWORDS.includes(word) && !matchedKeywords.includes(word)) {
      matchedKeywords.push(word);
    }
  }

  const isToxic = matchedKeywords.length > 0;
  return {
    isToxic,
    score: isToxic ? -1 : analyzeSentiment(text),
    matchedKeywords,
    reason: isToxic
      ? `Automated AI Moderation: Flagged for toxic or fraudulent keywords [${matchedKeywords.join(', ')}]`
      : null,
  };
};
