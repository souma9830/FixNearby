import mongoose from 'mongoose';

const emergencyServiceDispatchQueueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
    },
    emergencyCategory: {
      type: String,
      enum: ['water_leak', 'power_outage', 'gas_smell', 'lockout', 'hvac_failure', 'other'],
      required: true,
    },
    priorityLevel: {
      type: String,
      enum: ['high', 'urgent', 'critical_life_safety'],
      default: 'urgent',
    },
    locationCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: {
      type: String,
      required: true,
    },
    dispatchStatus: {
      type: String,
      enum: ['broadcasting', 'accepted', 'en_route', 'arrived', 'resolved', 'cancelled'],
      default: 'broadcasting',
    },
    etaMinutes: {
      type: Number,
      default: 15,
    },
  },
  { timestamps: true }
);

const EmergencyServiceDispatchQueue = mongoose.model(
  'EmergencyServiceDispatchQueue',
  emergencyServiceDispatchQueueSchema
);
export default EmergencyServiceDispatchQueue;
