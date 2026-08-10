import RolePermission from '../models/RolePermission.js';

// @desc    Get all RBAC role permission matrices
// @route   GET /api/roles
// @access  Private (Admin)
export const getRolePermissions = async (req, res, next) => {
  try {
    let roles = await RolePermission.find({});

    if (roles.length === 0) {
      const defaultRoles = [
        {
          roleName: 'SuperAdmin',
          scopes: [
            { scope: 'users:read', isAllowed: true, description: 'Read all users' },
            { scope: 'users:ban', isAllowed: true, description: 'Ban accounts' },
            { scope: 'payouts:approve', isAllowed: true, description: 'Approve wallet payouts' }
          ]
        },
        {
          roleName: 'SupportAgent',
          scopes: [
            { scope: 'users:read', isAllowed: true, description: 'Read all users' },
            { scope: 'disputes:resolve', isAllowed: true, description: 'Arbitrate disputes' },
            { scope: 'payouts:approve', isAllowed: false, description: 'Approve wallet payouts' }
          ]
        }
      ];
      roles = await RolePermission.insertMany(defaultRoles);
    }

    res.status(200).json({
      success: true,
      roles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scope permission in role matrix
// @route   PATCH /api/roles/:roleName/scopes
// @access  Private (Admin)
export const updateRoleScope = async (req, res, next) => {
  try {
    const { roleName } = req.params;
    const { scope, isAllowed } = req.body;

    const roleDoc = await RolePermission.findOne({ roleName });
    if (!roleDoc) {
      return res.status(404).json({ success: false, message: 'Role matrix not found' });
    }

    const scopeItem = roleDoc.scopes.find(s => s.scope === scope);
    if (scopeItem) {
      scopeItem.isAllowed = isAllowed;
    } else {
      roleDoc.scopes.push({ scope, isAllowed, description: `Scope ${scope}` });
    }

    await roleDoc.save();

    res.status(200).json({
      success: true,
      message: `Role "${roleName}" scope "${scope}" updated to ${isAllowed ? 'ALLOWED' : 'DENIED'}`,
      roleDoc
    });
  } catch (error) {
    next(error);
  }
};
