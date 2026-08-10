import EmergencyAlert from '../models/EmergencyAlert.js';
import Worker from '../models/Worker.js';
import { calculateEmergencyPriority } from '../services/emergencyDispatchService.js';

export const broadcastEmergencyAlert = async (req, res) => {
  try {
    const { issueType, description, location, severity = 'HIGH' } = req.body;
    const userId = req.user.id;

    const priorityInfo = calculateEmergencyPriority(severity, location);

    const activeWorkers = await Worker.countDocuments({ isAvailable: true });

    const alert = new EmergencyAlert({
      user: userId,
      issueType,
      description: req.sanitizedEmergency?.notes || description,
      location,
      status: 'broadcasting',
      notifiedWorkersCount: Math.max(activeWorkers, 3)
    });

    await alert.save();

    res.status(201).json({
      success: true,
      alert,
      priorityInfo
    });
  } catch (error) {
    res.status(500).json({ message: 'Emergency broadcast failed', error: error.message });
  }
};

export const getActiveEmergencyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'broadcasting' })
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch emergency alerts', error: error.message });
  }
};

export const acceptEmergencyDispatch = async (req, res) => {
  try {
    const { alertId } = req.params;
    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile required to accept dispatch' });
    }

    const alert = await EmergencyAlert.findOneAndUpdate(
      { _id: alertId, status: 'broadcasting' },
      { status: 'accepted', acceptedByWorker: worker._id },
      { new: true }
    );

    if (!alert) {
      return res.status(400).json({ message: 'Alert already accepted or no longer active' });
    }

    res.status(200).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept dispatch', error: error.message });
  }
};

export default {
  broadcastEmergencyAlert,
  getActiveEmergencyAlerts,
  acceptEmergencyDispatch
};
