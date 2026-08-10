import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    default: 'Admin Agent'
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'SupportAgent', 'OperationsLead'],
    default: 'SupportAgent'
  },
  action: {
    type: String,
    required: true
  },
  targetCategory: {
    type: String,
    default: 'general'
  },
  targetId: {
    type: String,
    default: null
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, {
  timestamps: true
});

adminLogSchema.index({ adminId: 1 });
adminLogSchema.index({ createdAt: -1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);
export default AdminLog;
