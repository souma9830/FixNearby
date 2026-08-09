const EmergencyDispatchTicket = require('../models/EmergencyDispatchTicket');

exports.createEmergencyDispatch = async (req, res) => {
  try {
    const { emergencyType, severityLevel, coordinates, address, notes } = req.body;
    const ticket = await EmergencyDispatchTicket.create({
      customerId: req.user._id,
      emergencyType,
      severityLevel,
      coordinates,
      address,
      notes
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency priority dispatch ticket created and broadcasted to nearby workers',
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptEmergencyDispatch = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const workerId = req.user._id;

    const ticket = await EmergencyDispatchTicket.findById(ticketId);
    if (!ticket || ticket.dispatchStatus !== 'BROADCASTING') {
      return res.status(400).json({ success: false, message: 'Ticket unavailable or already accepted' });
    }

    ticket.assignedWorkerId = workerId;
    ticket.dispatchStatus = 'WORKER_ACCEPTED';
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'Emergency ticket accepted successfully',
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
