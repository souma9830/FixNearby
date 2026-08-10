import Appliance from '../models/Appliance.js';

/**
 * @desc Add a new home appliance to user inventory
 * @route POST /api/appliances
 * @access Private
 */
export const registerAppliance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, brand, category, purchaseYear, serialNumber, lastServicedAt } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Appliance name and category are required' });
    }

    const appliance = await Appliance.create({
      userId,
      name,
      brand: brand || 'Generic',
      category,
      purchaseYear: Number(purchaseYear) || new Date().getFullYear(),
      serialNumber: serialNumber || '',
      lastServicedAt: lastServicedAt ? new Date(lastServicedAt) : new Date(),
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Appliance added to inventory',
      appliance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error registering appliance',
      error: error.message
    });
  }
};

/**
 * @desc Get user's home appliance inventory with maintenance status
 * @route GET /api/appliances
 * @access Private
 */
export const getUserAppliances = async (req, res) => {
  try {
    const userId = req.user._id;
    const appliances = await Appliance.find({ userId }).sort({ createdAt: -1 }).lean();

    const withMaintenanceStatus = appliances.map((item) => {
      const lastServiced = item.lastServicedAt ? new Date(item.lastServicedAt) : new Date(item.createdAt);
      const monthsSinceService = Math.floor((Date.now() - lastServiced.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const requiresMaintenance = monthsSinceService >= 6;

      return {
        ...item,
        monthsSinceService,
        requiresMaintenance,
        recommendedAction: requiresMaintenance
          ? `Servicing recommended: ${monthsSinceService} months since last maintenance`
          : 'Appliance in optimal condition'
      };
    });

    res.status(200).json({
      success: true,
      count: withMaintenanceStatus.length,
      appliances: withMaintenanceStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appliances',
      error: error.message
    });
  }
};
