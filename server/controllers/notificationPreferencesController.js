/**
 * @fileoverview Controller for managing user and worker notification preferences.
 */

import User from '../models/User.js';
import Worker from '../models/Worker.js';

const defaultPreferences = {
  booking: { email: true, sms: true, push: true },
  messages: { email: true, sms: false, push: true },
  reviews: { email: true, sms: false, push: true },
  promotions: { email: true, sms: false, push: false },
  system: { email: true, sms: true, push: true }
};

/**
 * Get notification preferences for the authenticated user or worker.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      user = await Worker.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User or Worker not found' });
    }

    const preferences = user.notificationPreferences || defaultPreferences;
    return res.status(200).json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error in getPreferences:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update notification preferences for the authenticated user or worker.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid preferences format' });
    }

    let user = await User.findById(userId);

    if (!user) {
      user = await Worker.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User or Worker not found' });
    }

    // Merge incoming preferences with defaults to ensure all keys exist
    user.notificationPreferences = { 
      ...defaultPreferences, 
      ...user.notificationPreferences, 
      ...preferences 
    };
    
    await user.save();

    return res.status(200).json({ 
      success: true, 
      data: user.notificationPreferences, 
      message: 'Preferences updated successfully' 
    });
  } catch (error) {
    console.error('Error in updatePreferences:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
