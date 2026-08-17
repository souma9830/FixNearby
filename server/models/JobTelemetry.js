import mongoose from 'mongoose';

const jobTelemetrySchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true
    },
    checkInCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Check-in coordinates are required'],
        validate: {
          validator: (coords) => Array.isArray(coords) && coords.length === 2 && coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90,
          message: 'Invalid check-in coordinates. Must be [lng, lat] within bounds.'
        }
      }
    },
    checkOutCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (coords) => !coords || coords.length === 0 || (coords.length === 2 && coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90),
          message: 'Invalid check-out coordinates. Must be [lng, lat] within bounds.'
        }
      }
    },
    distanceFromTargetMeters: {
      type: Number,
      required: true,
      min: [0, 'Distance cannot be negative']
    },
    geofenceRadiusMeters: {
      type: Number,
      default: 500
    },
    status: {
      type: String,
      enum: ['checked_in', 'checked_out'],
      default: 'checked_in'
    },
    checkInAt: {
      type: Date,
      default: Date.now
    },
    checkOutAt: {
      type: Date,
      default: null
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative']
    }
  },
  { timestamps: true }
);

jobTelemetrySchema.index({ bookingId: 1, workerId: 1 });
jobTelemetrySchema.index({ workerId: 1, status: 1 });

export default mongoose.model('JobTelemetry', jobTelemetrySchema);
