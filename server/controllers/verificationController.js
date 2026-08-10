import Verification from '../models/Verification.js';
import Worker from '../models/Worker.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Submit verification documents for a worker
// @route   POST /api/verification/submit
// @access  Private (Worker)
export const submitVerification = async (req, res, next) => {
  try {
    const workerId = req.worker._id;
    const {
      fullName,
      dateOfBirth,
      idType,
      idNumber
    } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full legal name is required'
      });
    }

    // Build file paths from uploaded files
    const files = req.files || {};
    const idDocFile = files.idDocument ? files.idDocument[0] : null;
    const selfieFile = files.selfieWithId ? files.selfieWithId[0] : null;
    const addressFile = files.addressProof ? files.addressProof[0] : null;
    const licenseFile = files.professionalLicense ? files.professionalLicense[0] : null;
    const insuranceFile = files.insuranceProof ? files.insuranceProof[0] : null;

    const fileUrl = (file) => {
      if (!file) return '';
      return `/uploads/${file.filename}`;
    };

    // Check if there's an existing rejected submission — allow resubmission
    const existing = await Verification.findOne({ workerId });

    const verificationData = {
      workerId,
      fullName,
      dateOfBirth: dateOfBirth || null,
      idType: idType || null,
      idNumber: idNumber || '',
      status: 'pending',
      rejectionReason: '',
      adminNotes: ''
    };

    // Only overwrite file fields if new files were uploaded
    if (idDocFile) verificationData.idDocument = fileUrl(idDocFile);
    if (selfieFile) verificationData.selfieWithId = fileUrl(selfieFile);
    if (addressFile) verificationData.addressProof = fileUrl(addressFile);
    if (licenseFile) verificationData.professionalLicense = fileUrl(licenseFile);
    if (insuranceFile) verificationData.insuranceProof = fileUrl(insuranceFile);

    // If resubmitting, keep existing files that weren't replaced
    if (existing) {
      if (!verificationData.idDocument && existing.idDocument) {
        verificationData.idDocument = existing.idDocument;
      }
      if (!verificationData.selfieWithId && existing.selfieWithId) {
        verificationData.selfieWithId = existing.selfieWithId;
      }
      if (!verificationData.addressProof && existing.addressProof) {
        verificationData.addressProof = existing.addressProof;
      }
      if (!verificationData.professionalLicense && existing.professionalLicense) {
        verificationData.professionalLicense = existing.professionalLicense;
      }
      if (!verificationData.insuranceProof && existing.insuranceProof) {
        verificationData.insuranceProof = existing.insuranceProof;
      }
    }

    let verification;
    if (existing) {
      verification = await Verification.findOneAndUpdate(
        { workerId },
        { $set: verificationData },
        { new: true, runValidators: true }
      );
    } else {
      verification = await Verification.create(verificationData);
    }

    res.status(200).json({
      success: true,
      message: 'Verification documents submitted successfully',
      verification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current worker's verification status
// @route   GET /api/verification/status
// @access  Private (Worker)
export const getVerificationStatus = async (req, res, next) => {
  try {
    const workerId = req.worker._id;

    const verification = await Verification.findOne({ workerId })
      .select('-__v')
      .lean();

    if (!verification) {
      return res.status(200).json({
        success: true,
        status: 'not_submitted',
        verification: null
      });
    }

    res.status(200).json({
      success: true,
      status: verification.status,
      verifiedAt: verification.verifiedAt,
      rejectionReason: verification.rejectionReason,
      adminNotes: verification.adminNotes,
      expiresAt: verification.expiresAt,
      verification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending verifications (admin)
// @route   GET /api/verification/pending
// @access  Private (Admin)
export const getPendingVerifications = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status || 'pending';

    const query = { status: statusFilter };
    const total = await Verification.countDocuments(query);

    const verifications = await Verification.find(query)
      .populate('workerId', 'name email category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: verifications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      verifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a verification (admin)
// @route   PATCH /api/verification/:id/approve
// @access  Private (Admin)
export const approveVerification = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    if (verification.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This verification is already approved'
      });
    }

    verification.status = 'approved';
    verification.verifiedAt = new Date();
    verification.adminNotes = adminNotes || '';
    // Verification valid for 1 year
    verification.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await verification.save();

    // Update the Worker model to reflect verified status
    try {
      await Worker.findByIdAndUpdate(verification.workerId, {
        isVerified: true,
        verificationBadge: 'verified'
      });
    } catch (workerErr) {
      console.error('Failed to update worker verification flag:', workerErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Verification approved successfully',
      verification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a verification (admin)
// @route   PATCH /api/verification/:id/reject
// @access  Private (Admin)
export const rejectVerification = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required'
      });
    }

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    verification.status = 'rejected';
    verification.rejectionReason = rejectionReason;
    await verification.save();

    res.status(200).json({
      success: true,
      message: 'Verification rejected',
      verification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verification statistics (admin)
// @route   GET /api/verification/stats
// @access  Private (Admin)
export const getVerificationStats = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [stats] = await Verification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).then(results => {
      const map = { pending: 0, approved: 0, rejected: 0, expired: 0, total: 0 };
      results.forEach(r => {
        map[r._id] = r.count;
        map.total += r.count;
      });
      return [map];
    });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a single document
// @route   POST /api/verification/upload
// @access  Private (Worker)
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    next(error);
  }
};
