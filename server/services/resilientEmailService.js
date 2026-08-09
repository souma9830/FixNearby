import CircuitBreaker from '../utils/circuitBreaker.js';

const emailBreaker = new CircuitBreaker({
  name: 'brevo-email',
  failureThreshold: 5,
  resetTimeoutMs: 60000
});

// Mock email service for this example
const emailClient = {
  sendTransacEmail: async (data) => ({ messageId: 'msg_123' })
};

/**
 * Sends an email resiliently
 * @param {string} to 
 * @param {string} subject 
 * @param {string} htmlContent 
 * @returns {Promise<Object>}
 */
export async function sendEmail(to, subject, htmlContent) {
  try {
    return await emailBreaker.execute(async () => {
      return await emailClient.sendTransacEmail({ to: [{ email: to }], subject, htmlContent });
    });
  } catch (err) {
    if (err.message.includes('is OPEN') || err.message.includes('is HALF_OPEN')) {
      console.log(`[Email Queued] To: ${to}, Subject: ${subject}`);
      return { queued: true, message: 'Email queued for later delivery' };
    }
    throw err;
  }
}

/**
 * Gets the Email service circuit breaker metrics
 * @returns {Object}
 */
export function getEmailHealth() {
  return emailBreaker.getMetrics();
}
