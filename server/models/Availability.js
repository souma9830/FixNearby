import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      unique: true,
      index: true,
    },
    weeklySchedule: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String,
          required: true,
          default: '09:00',
        },
        endTime: {
          type: String,
          required: true,
          default: '17:00',
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    blockedSlots: [
      {
        date: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    maxBookingsPerDay: {
      type: Number,
      default: 6
    },
    bufferMinutes: {
      type: Number,
      default: 30
    }
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
