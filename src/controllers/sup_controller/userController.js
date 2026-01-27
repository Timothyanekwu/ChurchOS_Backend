import User from '../../models/sup_model/User.js';
import Role from '../../models/sup_model/Role.js';

// @desc    Create a new user (Admin/Staff with permission)
// @route   POST /api/users
// @access  Private (Requires 'user.create')
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check availability
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Role Resolution
    let roleId;
    if (role) {
      // Find Role by Name
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        return res.status(400).json({ success: false, message: `Role '${role}' not found.` });
      }
      roleId = roleDoc._id;
    } else {
        // Default to Church Staff if not provided? Or make it required for Admin console?
        // Let's make it required or default to Staff.
        const defaultRole = await Role.findOne({ name: 'Church Staff' });
        roleId = defaultRole._id;
    }

    const user = await User.register({ name, email, password, role: roleId });

    // Return without sensitive data
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Requires 'user.read')
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate('role', 'name');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
