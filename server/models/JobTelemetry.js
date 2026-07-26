const mongoose = require('mongoose');

const CoordinatesSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

const JobTelemetrySchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  checkInCoordinates: { type: CoordinatesSchema, required: true },
  checkOutCoordinates: { type: CoordinatesSchema },
  distanceFromTargetMeters: { type: Number, required: true },
  checkInTimestamp: { type: Date, default: Date.now },
  checkOutTimestamp: { type: Date },
  durationMinutes: { type: Number },
  status: { type: String, enum: ['checked_in', 'checked_out'], default: 'checked_in' }
}, { timestamps: true });

module.exports = mongoose.model('JobTelemetry', JobTelemetrySchema);