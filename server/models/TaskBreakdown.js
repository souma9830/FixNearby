import mongoose from 'mongoose';

const taskBreakdownSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  leadWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  assignedSubWorkers: [{
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    role: { type: String, default: 'Assistant Technician' },
    assignedAt: { type: Date, default: Date.now }
  }],
  subTasks: [{
    taskId: { type: String, required: true },
    title: { type: String, required: true },
    weightPct: { type: Number, default: 25 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'verified'],
      default: 'pending'
    },
    proofImage: { type: String, default: '' },
    completedAt: { type: Date }
  }],
  overallProgressPct: {
    type: Number,
    default: 0
  },
  revenueDistribution: [{
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    payoutAmount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

const TaskBreakdown = mongoose.model('TaskBreakdown', taskBreakdownSchema);
export default TaskBreakdown;
