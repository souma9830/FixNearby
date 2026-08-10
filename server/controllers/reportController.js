import Report from '../models/Report.js';

const VALID_TARGET_TYPES = ['worker', 'review'];
const VALID_REASONS = ['inappropriate_content', 'fraud', 'spam', 'harassment', 'other'];

// @desc    Submit a report against a worker profile or review
// @route   POST /api/reports
// @access  Private (User)
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const reporter = req.user && req.user._id;

    if (!reporter) {
      return res.status(401).json({ message: 'You must be logged in to submit a report.' });
    }
    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({ message: 'targetType must be "worker" or "review".' });
    }
    if (!targetId) {
      return res.status(400).json({ message: 'targetId is required.' });
    }
    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({ message: `reason must be one of: ${VALID_REASONS.join(', ')}` });
    }

    const report = await Report.create({
      reporter,
      targetType,
      targetId,
      reason,
      details: details ? String(details).slice(0, 1000) : ''
    });

    return res.status(201).json({ message: 'Report submitted. Thank you for helping keep the platform safe.', report });
  } catch (err) {
    console.error('Create report error:', err);
    return res.status(500).json({ message: 'Server error while submitting report.' });
  }
};

// @desc    Get reports with pagination, optional status/targetType filters
// @route   GET /api/reports
// @access  Private (Admin)
export const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.targetType) filter.targetType = req.query.targetType;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(filter)
    ]);

    return res.status(200).json({
      reports,
      page,
      totalPages: Math.ceil(total / limit),
      totalReports: total
    });
  } catch (err) {
    console.error('Get reports error:', err);
    return res.status(500).json({ message: 'Server error while fetching reports.' });
  }
};

// @desc    Update a report's status
// @route   PATCH /api/reports/:reportId
// @access  Private (Admin)
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    const validStatuses = ['open', 'reviewing', 'resolved', 'dismissed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = status;
    if (status === 'resolved' || status === 'dismissed') {
      report.resolvedBy = req.user && req.user._id;
      report.resolvedAt = new Date();
    }
    await report.save();

    return res.status(200).json({ message: 'Report updated.', report });
  } catch (err) {
    console.error('Update report error:', err);
    return res.status(500).json({ message: 'Server error while updating report.' });
  }
};