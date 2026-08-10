import Message from '../models/Message.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import { calculateMessageRetryDelay } from '../services/messageRetryService.js';

/**
 * Helper to resolve participant profile metadata including verification status
 * Returns standardized partner profile object with identity & accreditation badges
 */
const resolvePartnerVerificationDetails = async (partnerId) => {
  if (!partnerId) {
    return { _id: null, isVerified: false, verificationBadge: null };
  }

  // 1. Try finding in Worker schema (Workers carry identity verification badges)
  const worker = await Worker.findById(partnerId)
    .select('name email category availabilityStatus isVerified verificationBadge profilePicture averageRating reviewCount karmaScore')
    .lean();

  if (worker) {
    return {
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      role: worker.category || 'Service Provider',
      userType: 'Worker',
      isVerified: Boolean(worker.isVerified),
      verificationBadge: worker.verificationBadge || (worker.isVerified ? 'Identity Verified' : null),
      profilePicture: worker.profilePicture || '',
      rating: worker.averageRating || 5.0,
      reviewCount: worker.reviewCount || 0,
      karmaScore: worker.karmaScore || 100,
      availabilityStatus: worker.availabilityStatus || 'offline',
    };
  }

  // 2. Fallback to User schema
  const user = await User.findById(partnerId)
    .select('name email role status lastActive')
    .lean();

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'Customer',
      userType: 'User',
      isVerified: false,
      verificationBadge: null,
      profilePicture: '',
      status: user.status || 'offline',
      lastActive: user.lastActive,
    };
  }

  return { _id: partnerId, isVerified: false, verificationBadge: null, userType: 'Unknown' };
};

/**
 * Retrieves chat history between current user and partnerId using cursor-based pagination.
 * GET /api/chat/history/:partnerId
 * Query params: limit (default 20), cursor (message _id), bookingId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { cursor, bookingId } = req.query;
    const currentUserId = req.user._id;

    // Build query for messages exchanged between current user and specified partner
    const query = {
      $or: [
        { senderId: currentUserId, receiverId: partnerId },
        { senderId: partnerId, receiverId: currentUserId }
      ],
      isDeleted: { $ne: true }
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    if (bookingId) {
      query.bookingId = bookingId;
    }

    // Retrieve messages sorted by timestamp descending
    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;
    const hasMore = messages.length === limit;
    const retryPolicy = calculateMessageRetryDelay(1);

    // Resolve partner verification & profile details
    const partnerInfo = await resolvePartnerVerificationDetails(partnerId);

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      nextCursor,
      hasMore,
      retryPolicy,
      partnerInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving chat history with partner verification',
      error: error.message
    });
  }
};

/**
 * Retrieves all active conversations for current user with last message & verification status.
 * GET /api/chat/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find distinct partner IDs from sent and received messages
    const sentTo = await Message.distinct('receiverId', { senderId: currentUserId });
    const receivedFrom = await Message.distinct('senderId', { receiverId: currentUserId });

    const partnerIds = [...new Set([...sentTo.map(String), ...receivedFrom.map(String)])];

    // Populate conversation summaries with partner verification details
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const lastMsg = await Message.findOne({
          $or: [
            { senderId: currentUserId, receiverId: partnerId },
            { senderId: partnerId, receiverId: currentUserId }
          ]
        }).sort({ _id: -1 }).lean();

        const unreadCount = await Message.countDocuments({
          senderId: partnerId,
          receiverId: currentUserId,
          status: { $ne: 'read' }
        });

        const partnerDetails = await resolvePartnerVerificationDetails(partnerId);

        return {
          id: partnerId,
          participant: partnerDetails.name || 'Service Partner',
          role: partnerDetails.role,
          userType: partnerDetails.userType,
          isVerified: partnerDetails.isVerified,
          verificationBadge: partnerDetails.verificationBadge,
          rating: partnerDetails.rating,
          lastMessage: lastMsg ? lastMsg.text : '',
          timestamp: lastMsg ? lastMsg.createdAt : new Date(),
          unread: unreadCount,
          online: partnerDetails.availabilityStatus === 'available' || partnerDetails.status === 'online',
        };
      })
    );

    conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation list',
      error: error.message
    });
  }
};

/**
 * Marks unread messages from partnerId as read.
 * PATCH /api/chat/read/:partnerId
 */
export const markAsRead = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    const result = await Message.updateMany(
      {
        senderId: partnerId,
        receiverId: currentUserId,
        status: { $ne: 'read' }
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read',
      error: error.message
    });
  }
};

/**
 * Retrieves total unread message counts grouped by sender.
 * GET /api/chat/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: currentUserId,
          status: { $ne: 'read' },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$senderId',
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    const totalUnread = unreadCounts.reduce((acc, curr) => acc + curr.unreadCount, 0);

    res.status(200).json({
      success: true,
      totalUnread,
      bySender: unreadCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving unread message counts',
      error: error.message
    });
  }
};

/**
 * Marks all incoming messages from a specific partner as read.
 * PATCH /api/chat/read
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const currentUserId = req.user._id;

    if (!partnerId) {
      return res.status(400).json({ success: false, message: 'Partner ID is required' });
    }

    const result = await Message.updateMany(
      { senderId: partnerId, receiverId: currentUserId, status: { $ne: 'read' } },
      { $set: { status: 'read', readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read',
      error: error.message
    });
  }
};

