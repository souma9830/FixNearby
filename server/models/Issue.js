import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title must be less than 200 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description must be less than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Traffic Light', 'Pothole', 'Street Light', 'Sidewalk', 'Drainage', 'Graffiti', 'Litter', 'Other']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    }
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  upvotes: {
    type: Number,
    default: 0,
    min: [0, 'Upvotes cannot be negative']
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  estimatedArrival: {
    type: Date,
    default: null
  },
  statusHistory: [{
    status: String,
    updatedAt: { type: Date, default: Date.now },
    note: String
  }],
  // Ensure these exist for calculation
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
issueSchema.index({ location: '2dsphere' });

// Create compound index for efficient queries
issueSchema.index({ location: '2dsphere', category: 1, status: 1 });

// Pre-save middleware to set location.coordinates from latitude/longitude
issueSchema.pre('save', function(next) {
  if (this.isModified('latitude') || this.isModified('longitude')) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude] // GeoJSON format: [lng, lat]
    };
  }
  next();
});

// Method to check if user has already upvoted
issueSchema.methods.hasUserUpvoted = function(userId) {
  return this.upvotedBy.some(id => id.toString() === userId.toString());
};

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
