import Issue from '../models/Issue.js';
import mongoose from 'mongoose';
import { queueNotification } from '../utils/queue.js';
import Booking from '../models/Booking.js';
import { getIo } from '../socket.js';

export const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate('reportedBy', 'name email')
      .sort({ upvotes: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNearbyIssues = async (req, res) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat);
    const lng = parseFloat(req.query.longitude || req.query.lng);
    const category = req.query.category;
    const radiusKm = parseFloat(req.query.radius || req.query.radiusKm || req.query.maxDistance) || 10;
    const zoom = req.query.zoom !== undefined ? parseInt(req.query.zoom) : 15;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      // Fallback: return top issues if coordinates are missing or invalid
      const fallbackIssues = await Issue.find(category && category !== 'All' ? { category } : {})
        .populate('reportedBy', 'name email')
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(50);
      return res.status(200).json({ type: 'list', data: fallbackIssues });
    }

    const maxDistanceMeters = Math.max(100, Math.min(100000, radiusKm * 1000));

    // LEVEL 3: SERVER-SIDE CLUSTERING for low zoom levels
    if (zoom < 10) {
      const clusters = await Issue.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'dist.calculated',
            maxDistance: maxDistanceMeters,
            spherical: true,
            key: 'location'
          }
        },
        { 
          $match: { 
            ...(category && category !== 'All' ? { category } : {})
          } 
        },
        {
          $group: {
            _id: {
              latBucket: { $round: ["$latitude", 1] }, 
              lngBucket: { $round: ["$longitude", 1] }
            },
            count: { $sum: 1 },
            latestIssue: { $first: "$$ROOT" }
          }
        }
      ]);
      return res.status(200).json({ type: 'cluster', data: clusters });
    }

    let query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters
        }
      }
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(100);

    return res.status(200).json({ type: 'list', data: issues });
  } catch (err) {
    console.error('getNearbyIssues error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createIssue = async (req, res) => {
  const executeCreate = async (useSession) => {
    let session = null;
    if (useSession) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch (err) {
        session = null;
      }
    }

    const { title, description, category, latitude, longitude } = req.body;

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    const thumbnailUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.thumbnailUrl || null;

    // Concurrency Check: Verify no existing open issue is registered within exact close coordinates
    const query = {
      category,
      status: 'open',
      latitude: { $gte: parsedLat - 0.0001, $lte: parsedLat + 0.0001 },
      longitude: { $gte: parsedLng - 0.0001, $lte: parsedLng + 0.0001 }
    };

    const duplicate = session
      ? await Issue.findOne(query).session(session)
      : await Issue.findOne(query);

    if (duplicate) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return {
        status: 409,
        data: {
          success: false,
          message: 'A similar issue in this location has already been reported and is currently open.'
        }
      };
    }

    const newIssue = new Issue({
      title,
      description,
      category,
      latitude: parsedLat,
      longitude: parsedLng,
      location: {
        type: 'Point',
        coordinates: [parsedLng, parsedLat]
      },
      thumbnailUrl,
      reportedBy: req.user ? req.user._id : undefined
    });

    if (session) {
      await newIssue.save({ session });
      await session.commitTransaction();
      session.endSession();
    } else {
      await newIssue.save();
    }

    // Populate reportedBy attribution
    if (newIssue.reportedBy) {
      await newIssue.populate('reportedBy', 'name email');
    }

    // Emit Socket.IO event for real-time live map feed
    try {
      const io = getIo();
      if (io) {
        io.emit('new_issue', { issue: newIssue });
        io.emit('civic_issue_created', { issue: newIssue });
      }
    } catch (ioErr) {
      console.warn('Socket broadcast error:', ioErr.message);
    }

    // Queue civic report notification
    try {
      await queueNotification('civic_report_created', { issueId: newIssue._id });
    } catch (notifyErr) {
      console.error('Failed to queue notification:', notifyErr.message);
    }

    return {
      status: 201,
      data: { success: true, data: newIssue }
    };
  };

  try {
    const { title, description, category, latitude, longitude } = req.body;
    
    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, latitude, and longitude.'
      });
    }

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinate parameters. Latitude must be between -90 and 90, and Longitude must be between -180 and 180.'
      });
    }

    let result;
    try {
      result = await executeCreate(true);
    } catch (err) {
      if (err.message.includes('Transaction numbers are only allowed') || err.code === 20) {
        console.warn('MongoDB transactions not supported. Retrying issue creation without session...');
        result = await executeCreate(false);
      } else {
        throw err;
      }
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upvoteIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required to upvote' });
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: id, upvotedBy: { $ne: userId } },
      {
        $inc: { upvotes: 1 },
        $addToSet: { upvotedBy: userId },
      },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!issue) {
      const exists = await Issue.exists({ _id: id });
      if (!exists) return res.status(404).json({ message: 'Issue not found' });
      return res.status(409).json({ message: 'You have already upvoted this issue' });
    }

    // Emit Socket.IO event
    try {
      const io = getIo();
      if (io) {
        io.emit('issue_updated', { issue });
      }
    } catch (ioErr) {
      console.warn('Socket broadcast error:', ioErr.message);
    }

    return res.status(200).json(issue);
  } catch (err) {
    console.error('upvoteIssue error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const id = req.params.id;
    const issue = await Issue.findById(id).populate('reportedBy', 'name email');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    return res.status(200).json(issue);
  } catch (err) {
    console.error('getIssueById error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const oldStatus = issue.status;
    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    }
    issue.statusHistory.push({ status, note: note || '', updatedAt: new Date() });
    await issue.save();
    await issue.populate('reportedBy', 'name email');

    // Emit Socket.IO event for real-time status updates
    try {
      const io = getIo();
      if (io) {
        io.emit('issue_updated', { issue });
      }
    } catch (ioErr) {
      console.warn('Socket broadcast error:', ioErr.message);
    }

    // Queue status update notification
    try {
      await queueNotification('issue_status_update', {
        issueId: issue._id,
        oldStatus,
        newStatus: status
      });
    } catch (notifyErr) {
      console.warn('Failed to queue notification:', notifyErr.message);
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- Dispute Handlers ----------
export const createBookingDispute = async (req, res) => {
  try {
    const { bookingId, title, description } = req.body;
    if (!bookingId || !title || !description) {
      return res.status(400).json({ success: false, message: 'bookingId, title, and description are required' });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You can only dispute your own bookings' });
    }
    const newIssue = new Issue({
      title,
      description,
      category: 'Booking Dispute',
      bookingId: booking._id,
      workerId: booking.workerId,
      reportedBy: req.user._id,
    });
    await newIssue.save();
    await queueNotification('booking_dispute_created', { issueId: newIssue._id, bookingId });
    return res.status(201).json({ success: true, data: newIssue });
  } catch (err) {
    console.error('createBookingDispute error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const respondToDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Response message is required' });
    }
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    if (issue.category !== 'Booking Dispute') {
      return res.status(400).json({ success: false, message: 'Not a booking dispute' });
    }
    if (String(issue.workerId) !== String(req.user._id) && req.user.role !== 'worker') {
      return res.status(403).json({ success: false, message: 'Only the assigned worker can respond' });
    }
    issue.responses.push({ responder: req.user._id, message });
    await issue.save();
    await queueNotification('dispute_response', { issueId: issue._id, responderId: req.user._id });
    return res.status(200).json({ success: true, data: issue });
  } catch (err) {
    console.error('respondToDispute error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const supportReviewDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    const oldStatus = issue.status;
    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    }
    issue.statusHistory.push({ status, note: note || '', updatedAt: new Date() });
    await issue.save();
    await queueNotification('dispute_status_updated', { issueId: issue._id, oldStatus, newStatus: status });
    return res.status(200).json({ success: true, data: issue });
  } catch (err) {
    console.error('supportReviewDispute error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
