const mongoose = require('mongoose');

const emergencyDispatchTicketSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  emergencyType: {
    type: String,
    enum: ['PIPE_BURST', 'ELECTRICAL_HAZARD', 'GAS_LEAK_ALERT', 'LOCKOUT_URGENT', 'HVAC_FAILURE'],
    required: true
  },
  severityLevel: {
    type: String,
    enum: ['CRITICAL', 'HIGH_URGENCY', 'MODERATE'],
    default: 'HIGH_URGENCY'
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: {
    type: String,
    required: true
  },
  dispatchStatus: {
    type: String,
    enum: ['BROADCASTING', 'WORKER_ACCEPTED', 'DISPATCHED_EN_ROUTE', 'ARRIVED_ON_SITE', 'RESOLVED', 'CANCELLED'],
    default: 'BROADCASTING',
    index: true
  },
  broadcastRadiusKm: {
    type: Number,
    default: 15
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('EmergencyDispatchTicket', emergencyDispatchTicketSchema);
