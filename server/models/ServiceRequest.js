import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryName: {
    type: String,
    required: [true, 'Service category name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  location: {
    type: String,
    default: ''
  },
  preferredSchedule: {
    type: String,
    enum: ['ASAP', 'This week', 'Next week', 'Flexible'],
    default: 'Flexible'
  },
  budget: {
    type: String,
    enum: ['Under $50', '$50-$100', '$100-$200', '$200+', 'Not sure'],
    default: 'Not sure'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  voteCount: {
    type: Number,
    default: 0,
    min: 0
  },
  questionnaireData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  photoUrls: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Query indexes
serviceRequestSchema.index({ status: 1, createdAt: -1 });
serviceRequestSchema.index({ userId: 1, createdAt: -1 });
serviceRequestSchema.index({ categoryName: 1 });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
