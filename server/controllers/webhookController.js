import crypto from 'crypto';
import WebhookSubscription from '../models/WebhookSubscription.js';
import { webhookDispatcher } from '../services/webhookService.js';

/**
 * Create a new webhook subscription
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const createWebhook = async (req, res) => {
  try {
    const { url, events } = req.body;
    
    if (!url || !events || !events.length) {
      return res.status(400).json({ success: false, message: 'URL and events are required' });
    }

    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await WebhookSubscription.create({
      userId: req.user._id,
      url,
      events,
      secret
    });

    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * List all webhooks for a user
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const listWebhooks = async (req, res) => {
  try {
    const webhooks = await WebhookSubscription.find({ userId: req.user._id });
    res.status(200).json({ success: true, data: webhooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update a webhook subscription
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const updateWebhook = async (req, res) => {
  try {
    const { url, events, isActive } = req.body;
    const webhook = await WebhookSubscription.findOne({ _id: req.params.id, userId: req.user._id });

    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (typeof isActive !== 'undefined') webhook.isActive = isActive;

    await webhook.save();
    res.status(200).json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a webhook subscription
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const deleteWebhook = async (req, res) => {
  try {
    const webhook = await WebhookSubscription.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    res.status(200).json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send a test event to a webhook
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const testWebhook = async (req, res) => {
  try {
    const webhook = await WebhookSubscription.findOne({ _id: req.params.id, userId: req.user._id });

    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    const testPayload = {
      test: true,
      timestamp: new Date().toISOString()
    };

    const eventType = webhook.events.length > 0 ? webhook.events[0] : 'ping';
    
    await webhookDispatcher.sendWebhook(webhook, eventType, testPayload);
    
    res.status(200).json({ success: true, message: 'Test webhook sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get delivery logs (last triggered/failures) for a webhook
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getWebhookLogs = async (req, res) => {
  try {
    const webhook = await WebhookSubscription.findOne({ _id: req.params.id, userId: req.user._id });

    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        lastTriggeredAt: webhook.lastTriggeredAt,
        failureCount: webhook.failureCount,
        lastFailureAt: webhook.lastFailureAt,
        lastFailureReason: webhook.lastFailureReason,
        isActive: webhook.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
