import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [1000, 'Review text must be less than 1000 characters']
  },
  bookingReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required'],
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    default: ''
  },
  reportedAt: {
    type: Date
  },
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'flagged'],
    default: 'approved'
  },
  adminNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate Average Rating static method
reviewSchema.statics.calculateAverageRating = async function(workerId) {
  const stats = await this.aggregate([
    { $match: { worker: workerId } },
    {
      $group: {
        _id: '$worker',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Worker').findByIdAndUpdate(workerId, {
      reviewCount: stats[0].nRating,
      averageRating: Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    await mongoose.model('Worker').findByIdAndUpdate(workerId, {
      reviewCount: 0,
      averageRating: 0
    });
  }
};

// Indexes for common review query patterns
reviewSchema.index({ worker: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ moderationStatus: 1, createdAt: -1 });
reviewSchema.index({ worker: 1, moderationStatus: 1, createdAt: -1 });
reviewSchema.index({ reportedAt: -1 });

reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.worker);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
