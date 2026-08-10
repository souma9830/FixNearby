import mongoose from 'mongoose';

const workerMultiLocationGeofenceSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    primaryCity: {
      type: String,
      required: true,
    },
    serviceZones: [
      {
        zoneName: { type: String, required: true },
        centerCoordinates: {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
        },
        radiusKm: { type: Number, required: true, default: 10 },
        activeStatus: { type: Boolean, default: true },
      },
    ],
    maxTravelRadiusKm: {
      type: Number,
      default: 50,
    },
    travelSurchargePerKm: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const WorkerMultiLocationGeofence = mongoose.model('WorkerMultiLocationGeofence', workerMultiLocationGeofenceSchema);
export default WorkerMultiLocationGeofence;
