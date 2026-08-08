/**
 * Chat Message Retry Exponential Backoff Service
 */
export const calculateMessageRetryDelay = (attemptNumber, baseDelayMs = 1000, maxDelayMs = 30000) => {
  const attempt = Math.max(1, Number(attemptNumber) || 1);
  const delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
  const jitter = Math.floor(Math.random() * 200);

  return {
    attempt,
    delayMs: delay + jitter,
    shouldRetry: attempt <= 5,
    isFinalAttempt: attempt === 5
  };
};

export const sanitizeChatMessagePayload = (content = '') => {
  if (typeof content !== 'string') return '';
  return content.replace(/[<>{}]/g, '').trim().slice(0, 1000);
};

export const messageRetryService = {
  calculateMessageRetryDelay,
  sanitizeChatMessagePayload
};
