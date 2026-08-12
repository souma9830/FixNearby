import EmergencyDispatchTicket from '../models/EmergencyDispatchTicket.js';
import EmergencyDispatchEscalationAudit from '../models/EmergencyDispatchEscalationAudit.js';

export const createEmergencyDispatch = async (req, res) => {
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

    await EmergencyDispatchEscalationAudit.create({
      ticketId: ticket._id,
      escalationLevel: 1,
      broadcastRadiusKm: ticket.broadcastRadiusKm || 15,
      escalationTriggerReason: 'Initial emergency dispatch broadcast initiated',
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

export const acceptEmergencyDispatch = async (req, res) => {
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

export const escalateEmergencyBroadcast = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { expandedRadiusKm, escalationLevel } = req.body;

    const ticket = await EmergencyDispatchTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.broadcastRadiusKm = expandedRadiusKm || ticket.broadcastRadiusKm + 15;
    await ticket.save();

    const audit = await EmergencyDispatchEscalationAudit.create({
      ticketId: ticket._id,
      escalationLevel: escalationLevel || 2,
      broadcastRadiusKm: ticket.broadcastRadiusKm,
      escalationTriggerReason: 'Expanded broadcast radius due to unanswered dispatch timeout',
    });

    return res.status(200).json({
      success: true,
      message: 'Emergency ticket expanded broadcast radius escalated successfully',
      data: ticket,
      audit,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

