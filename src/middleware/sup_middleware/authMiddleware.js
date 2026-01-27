import jwt from 'jsonwebtoken';
import User from '../../models/sup_model/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate({
      path: 'role',
      populate: {
        path: 'permissions'
      }
    });

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        success: false, 
        message: 'Role not found/assigned' 
      });
    }

    // req.user.role is populated with the Role document which contains permissions array of ObjectIds.
    // However, in the protect middleware: req.user = await User.findById(decoded.id);
    // User.findById() does NOT automatically populate. I need to populate role and its permissions there.
    
    // We'll update 'protect' to populate role and permissions.
    // Check if role has ANY of the required permissions (OR logic) or ALL? 
    // Usually 'hasPermission' is exact match.
    // But let's verify logic below.
    
    const userPermissions = req.user.role.permissions.map(p => p.name);
    
    // Check if Super Admin (often has access to everything)
    // Based on seed, Super Admin has '*' in seed logic, but does it resolve to all perms?
    // In seedRoles.js: if '*' ... permissionIds = getAllPermissionIds();
    // So permissions array will effectively have ALL permissions.
    
    // Check overlap
    const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission));

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role.name}' is not authorized to access this route` 
      });
    }
    next();
  };
};
