import mongoose from 'mongoose';

const geofenceBoundaryViolationLogSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    detectedLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    nearestZoneName: {
      type: String,
      default: 'Out of Zone',
    },
    distanceExcessKm: {
      type: Number,
      required: true,
    },
    autoAlertTriggered: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const GeofenceBoundaryViolationLog = mongoose.model('GeofenceBoundaryViolationLog', geofenceBoundaryViolationLogSchema);
export default GeofenceBoundaryViolationLog;
