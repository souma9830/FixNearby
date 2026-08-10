import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      unique: true
    },
    radiusKm: {
      type: Number,
      default: 10
    },
    centerAddress: {
      type: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    maxTravelTimeMinutes: {
      type: Number,
      default: 45
    }
  },
  { timestamps: true }
);

geofenceSchema.index({ location: '2dsphere' });

export default mongoose.model('Geofence', geofenceSchema);
