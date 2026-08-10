import Worker from '../models/Worker.js';
import Availability from '../models/Availability.js';

export const getWorkerAvailability = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const availability = await Availability.find({ worker: workerId }).sort({ day: 1 });
    res.status(200).json({ success: true, schedule: availability });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
};

export const addAvailabilitySlot = async (req, res) => {
  try {
    const { day, startTime, endTime, isRecurring } = req.body;
    const userId = req.user.id;

    const worker = await Worker.findOne({ user: userId });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found for user' });
    }

    const newSlot = new Availability({
      worker: worker._id,
      day,
      startTime,
      endTime,
      isRecurring: isRecurring !== undefined ? isRecurring : true
    });

    await newSlot.save();

    const updatedSlots = await Availability.find({ worker: worker._id });
    res.status(201).json({ success: true, schedule: updatedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error adding availability slot', error: error.message });
  }
};

export const removeAvailabilitySlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const userId = req.user.id;

    const worker = await Worker.findOne({ user: userId });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    await Availability.findOneAndDelete({ _id: slotId, worker: worker._id });
    const updatedSlots = await Availability.find({ worker: worker._id });

    res.status(200).json({ success: true, schedule: updatedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Error removing availability slot', error: error.message });
  }
};

export const checkSlotAvailability = async (req, res) => {
  try {
    const { workerId, date, time } = req.query;
    if (!workerId || !date || !time) {
      return res.status(400).json({ message: 'Missing parameters: workerId, date, and time are required' });
    }

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'Monday' });
    const slots = await Availability.find({ worker: workerId, day: dayOfWeek });
    
    const isAvailable = slots.some((s) => time >= s.startTime && time <= s.endTime);
    res.status(200).json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ message: 'Error checking slot availability', error: error.message });
  }
};

export const updateCalendarSettings = async (req, res) => {
  try {
    const { maxBookingsPerDay, bufferMinutes } = req.body;
    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const availability = await Availability.findOneAndUpdate(
      { workerId: worker._id },
      { maxBookingsPerDay, bufferMinutes },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, availability });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  getWorkerAvailability,
  addAvailabilitySlot,
  removeAvailabilitySlot,
  checkSlotAvailability,
  updateCalendarSettings
};
