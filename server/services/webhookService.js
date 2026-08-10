import crypto from 'crypto';
import WebhookSubscription from '../models/WebhookSubscription.js';

/**
 * Service for dispatching webhooks
 */
class WebhookDispatcher {
  /**
   * Dispatches an event to all active subscriptions
   * @param {string} eventName - Name of the event
   * @param {Object} payload - Event payload
   */
  async dispatch(eventName, payload) {
    try {
      const subscriptions = await WebhookSubscription.find({
        events: eventName,
        isActive: true
      });

      for (const subscription of subscriptions) {
        // Send webhook asynchronously without waiting for all to finish before moving to next
        this.sendWebhook(subscription, eventName, payload).catch(err => {
          console.error(`Failed to dispatch webhook ${subscription._id}`, err);
        });
      }
    } catch (error) {
      console.error('Webhook dispatch error:', error);
    }
  }

  /**
   * Generates HMAC signature for payload
   * @param {Object} payload 
   * @param {string} secret 
   * @returns {string} Hex signature
   */
  generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Sends HTTP POST request with retries
   * @param {Object} subscription - WebhookSubscription document
   * @param {string} eventName - Event name
   * @param {Object} payload - Event payload
   */
  async sendWebhook(subscription, eventName, payload) {
    const signature = this.generateSignature(payload, subscription.secret);
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(subscription.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': eventName,
            'X-Webhook-Signature': signature
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          subscription.lastTriggeredAt = new Date();
          subscription.failureCount = 0; // Reset failure count on success
          await subscription.save();
          return; // Success, exit retry loop
        } else {
          throw new Error(`HTTP Status ${response.status}`);
        }
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          subscription.failureCount += 1;
          subscription.lastFailureAt = new Date();
          subscription.lastFailureReason = error.message;
          
          if (subscription.failureCount >= 10) {
            subscription.isActive = false;
          }
          
          await subscription.save();
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s (Math.pow(2, attempt - 1) * 1000)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
}

export const webhookDispatcher = new WebhookDispatcher();
