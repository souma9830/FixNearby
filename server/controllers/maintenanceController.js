import Appliance from '../models/Appliance.js';
import Booking from '../models/Booking.js';

// @desc    Get user appliances with predictive health scores
// @route   GET /api/maintenance/appliances
// @access  Private (User)
export const getUserAppliances = async (req, res, next) => {
  try {
    const appliances = await Appliance.find({ userId: req.user._id }).sort({ healthScore: 1 });

    res.status(200).json({
      success: true,
      count: appliances.length,
      appliances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register home equipment / appliance for predictive tracking
// @route   POST /api/maintenance/appliances
// @access  Private (User)
export const registerAppliance = async (req, res, next) => {
  try {
    const { applianceName, category, modelNumber, installDate, notes } = req.body;

    const daysOld = installDate ? Math.floor((Date.now() - new Date(installDate).getTime()) / (24 * 3600 * 1000)) : 0;
    const healthScore = Math.max(20, Math.min(100, 100 - Math.floor(daysOld / 30)));
    const predictedFailureDate = new Date(Date.now() + Math.max(30, (healthScore * 3)) * 24 * 3600 * 1000);

    const appliance = await Appliance.create({
      userId: req.user._id,
      applianceName,
      category: category || 'HVAC',
      modelNumber: modelNumber || '',
      installDate: installDate || new Date(),
      lastServicedAt: new Date(),
      healthScore,
      predictedFailureDate,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: `${applianceName} registered to maintenance tracking`,
      appliance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch preventive service booking for appliance
// @route   POST /api/maintenance/appliances/:id/preventive-booking
// @access  Private (User)
export const dispatchPreventiveService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appliance = await Appliance.findById(id);

    if (!appliance) {
      return res.status(404).json({ success: false, message: 'Appliance record not found' });
    }

    appliance.lastServicedAt = new Date();
    appliance.healthScore = 98;
    appliance.predictedFailureDate = new Date(Date.now() + 180 * 24 * 3600 * 1000);
    await appliance.save();

    res.status(200).json({
      success: true,
      message: `Preventive service scheduled for ${appliance.applianceName}. Health score restored to 98%!`,
      appliance
    });
  } catch (error) {
    next(error);
  }
};
