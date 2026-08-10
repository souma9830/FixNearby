import DamageAssessment from '../models/DamageAssessment.js';
import { analyzeDamageImage } from '../services/visionService.js';

// @desc    Scan damage image using AI vision pipeline
// @route   POST /api/ai-diagnostics/scan
// @access  Private
export const scanDamagePhoto = async (req, res, next) => {
  try {
    const { imageUrl = 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7' } = req.body;

    const analysis = await analyzeDamageImage(imageUrl);

    const assessment = await DamageAssessment.create({
      userId: req.user._id,
      imageUrl,
      ...analysis
    });

    res.status(201).json({
      success: true,
      message: 'AI damage photo assessment completed successfully',
      assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user damage assessment history
// @route   GET /api/ai-diagnostics/history
// @access  Private
export const getDamageHistory = async (req, res, next) => {
  try {
    const assessments = await DamageAssessment.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    next(error);
  }
};
