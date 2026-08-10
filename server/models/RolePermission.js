import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema({
  roleName: {
    type: String,
    enum: ['SuperAdmin', 'SupportAgent', 'OperationsLead', 'FinanceAuditor'],
    required: true,
    unique: true
  },
  scopes: [{
    scope: { type: String, required: true },
    isAllowed: { type: Boolean, default: true },
    description: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);
export default RolePermission;
