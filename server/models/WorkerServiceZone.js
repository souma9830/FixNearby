import mongoose from 'mongoose';

const workerServiceZoneSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  zoneName: {
    type: String,
    required: true,
    trim: true,
  },
  centerCoordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  serviceRadiusKm: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  travelSurcharge: {
    type: Number,
    default: 0,
  },
  isActiveZone: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('WorkerServiceZone', workerServiceZoneSchema);
