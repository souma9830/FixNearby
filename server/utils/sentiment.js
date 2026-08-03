const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'perfect', 'helpful', 'professional', 'fast', 'clean', 'awesome', 'friendly', 'recommend', 'superb', 'best'];
const NEGATIVE_WORDS = ['bad', 'poor', 'terrible', 'worst', 'rude', 'late', 'dirty', 'unprofessional', 'slow', 'horrible', 'awful', 'overpriced', 'scam', 'waste'];

/**
 * Analyzes the sentiment of a text block based on keyword match frequencies.
 * Returns a score between -1 and 1 (-1: Negative, 0: Neutral, 1: Positive).
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
