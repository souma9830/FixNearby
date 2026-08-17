import mongoose from 'mongoose';

const multiLocationGeofenceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  zoneName: {
    type: String,
    required: true,
    trim: true
  },
  centerCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radiusKm: {
    type: Number,
    required: true,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('MultiLocationGeofence', multiLocationGeofenceSchema);
