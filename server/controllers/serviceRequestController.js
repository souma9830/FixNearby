import ServiceRequest from '../models/ServiceRequest.js';

// @desc    Create a new service request
// @route   POST /api/service-requests
// @access  Private
export const createRequest = async (req, res) => {
  try {
    const { categoryName, description, urgency, location, preferredSchedule, budget, questionnaireData, photoUrls } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'categoryName is required'
      });
    }

    const request = await ServiceRequest.create({
      userId: req.user._id,
      categoryName: categoryName.trim(),
      description: (description || 'Structured Quote Request Wizard Lead').trim(),
      urgency: urgency || 'medium',
      location: location || '',
      preferredSchedule: preferredSchedule || 'Flexible',
      budget: budget || 'Not sure',
      questionnaireData: questionnaireData || {},
      photoUrls: Array.isArray(photoUrls) ? photoUrls : []
    });

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get the current user's service requests
// @route   GET /api/service-requests/my
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      ServiceRequest.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServiceRequest.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      success: true,
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all service requests (admin view)
// @route   GET /api/service-requests/all
// @access  Private (admin)
export const getAllRequests = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [requests, total] = await Promise.all([
      ServiceRequest.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServiceRequest.countDocuments(filter)
    ]);

    res.json({
      success: true,
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single service request by ID
// @route   GET /api/service-requests/:id
// @access  Public
export const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('userId', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const { verifyWarrantyCoverage } = await import('../services/serviceWarrantyCoverageService.js');
    const warrantyInfo = verifyWarrantyCoverage(request.createdAt);

    res.json({ success: true, request, warrantyInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update the status and admin notes of a service request
// @route   PATCH /api/service-requests/:id/status
// @access  Private (admin)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const validStatuses = ['pending', 'reviewed', 'approved', 'rejected', 'fulfilled'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;

    await request.save();

    res.json({
      success: true,
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment the vote count for a service request
// @route   POST /api/service-requests/:id/upvote
// @access  Public (simplified — no duplicate tracking for now)
export const upvoteRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { $inc: { voteCount: 1 } },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get distinct service category names
// @route   GET /api/service-requests/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await ServiceRequest.distinct('categoryName');
    res.json({ success: true, categories: categories.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
