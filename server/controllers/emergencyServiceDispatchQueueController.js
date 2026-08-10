import EmergencyServiceDispatchQueue from '../models/EmergencyServiceDispatchQueue.js';

export const dispatchEmergencyTicket = async (req, res, next) => {
  try {
    const { emergencyCategory, priorityLevel, lat, lng, address } = req.body;
    const userId = req.user.id;

    const ticket = await EmergencyServiceDispatchQueue.create({
      userId,
      emergencyCategory,
      priorityLevel,
      locationCoordinates: { lat, lng },
      address,
      dispatchStatus: 'broadcasting',
      etaMinutes: 15,
    });

    res.status(201).json({
      success: true,
      message: 'Emergency priority ticket dispatched to nearby workers',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveEmergencyDispatches = async (req, res, next) => {
  try {
    const dispatches = await EmergencyServiceDispatchQueue.find({
      dispatchStatus: { $in: ['broadcasting', 'accepted', 'en_route'] },
    })
      .populate('userId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: dispatches.length, data: dispatches });
  } catch (error) {
    next(error);
  }
};

export const updateDispatchStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { dispatchStatus, workerId, etaMinutes } = req.body;

    const updateObj = { dispatchStatus };
    if (workerId) updateObj.assignedWorkerId = workerId;
    if (etaMinutes) updateObj.etaMinutes = etaMinutes;

    const ticket = await EmergencyServiceDispatchQueue.findByIdAndUpdate(ticketId, updateObj, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Dispatch status updated', data: ticket });
  } catch (error) {
    next(error);
  }
};
