import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { getIo } from '../socket.js';
import { notificationQueueEngine } from '../services/notificationQueueEngine.js';

export const getQueueStatus = async (req, res) => {
  try {
    const stats = notificationQueueEngine.getQueueStats();
    res.status(200).json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get paginated notifications for the authenticated user/worker
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.worker?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = { userId };

    // Optional type filter
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Optional read filter
    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('workerId', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, read: false })
    ]);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.worker?._id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.worker?._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.worker?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const count = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.worker?._id;
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Helper: create a notification internally (used by other services)
// Not exported as a route handler
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      userId: data.userId,
      workerId: data.workerId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || '',
      priority: data.priority || 'normal',
      metadata: data.metadata || {}
    });
    return notification;
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
    return null;
  }
};
const normalizeRecipient = ({ userId, userModel, workerId, workerModel, recipientId, recipientModel }) => {
  // Accept either direct recipientId/recipientModel OR userId/userModel OR workerId/workerModel
  const id = recipientId || userId || workerId;
  const model = recipientModel || userModel || workerModel;
  return { id, model };
};

export const sendNotification = async (req, res, next) => {
  try {
    const {
      userId,
      userModel,
      workerId,
      workerModel,
      recipientId,
      recipientModel,
      type,
      title,
      message,
      entityId,
    } = req.body;

    const { id, model } = normalizeRecipient({
      userId,
      userModel,
      workerId,
      workerModel,
      recipientId,
      recipientModel,
    });

    if (!id || !model) {
      return res.status(400).json({
        success: false,
        message: 'recipientId/recipientModel (or userId/userModel or workerId/workerModel) is required',
      });
    }

    if (!['User', 'Worker'].includes(model)) {
      return res.status(400).json({ success: false, message: 'recipientModel must be User or Worker' });
    }

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'type, title, and message are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid recipientId' });
    }

    if (entityId && !mongoose.Types.ObjectId.isValid(entityId)) {
      return res.status(400).json({ success: false, message: 'Invalid entityId' });
    }

    const notification = await Notification.create({
      recipientId: id,
      recipientModel: model,
      type,
      title,
      message,
      entityId: entityId || undefined,
      status: 'unread',
      readAt: null,
    });

    // Emit to personal room: socket.join(userId)
    try {
      const io = getIo();
      io?.to(String(id)).emit('notification:new', { notification });
    } catch {}

    res.status(201).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

export const listMyNotifications = async (req, res, next) => {
  try {
    const principal = req.principal || req.user; // support potential middleware differences
    const { _id } = principal;
    const model = principal?.model || principal?.userType || (req.userType === 'Worker' ? 'Worker' : 'User');

    // In this codebase, authMiddleware sets req.user and likely includes role/model.
    // We'll fall back to req.user.role if present.
    const resolvedModel = model || (principal?.role ? (principal.role === 'worker' ? 'Worker' : 'User') : 'User');

    const notifications = await Notification.find({
      recipientId: _id,
      recipientModel: resolvedModel,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => n.status === 'unread').length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const principal = req.principal || req.user;
    const { _id } = principal;
    const model = principal?.model || principal?.userType || (req.userType === 'Worker' ? 'Worker' : 'User');
    const resolvedModel = model || (principal?.role ? (principal.role === 'worker' ? 'Worker' : 'User') : 'User');

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipientId: _id, recipientModel: resolvedModel },
      { status: 'read', readAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification: updated });
  } catch (err) {
    next(err);
  }
};
