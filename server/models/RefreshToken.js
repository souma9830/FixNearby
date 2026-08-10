import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyId: {
    type: String,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String,
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
