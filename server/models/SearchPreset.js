import mongoose from 'mongoose';

const searchPresetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  query: {
    type: String,
    default: ''
  },
  filters: {
    category: { type: String, default: 'All' },
    minPrice: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 100 },
    minRating: { type: Number, default: 0 },
    maxDistance: { type: Number, default: 50 },
    availability: { type: String, default: 'all' },
    sortBy: { type: String, default: 'distance' }
  }
}, {
  timestamps: true
});

searchPresetSchema.index({ user: 1 });

const SearchPreset = mongoose.model('SearchPreset', searchPresetSchema);
export default SearchPreset;
