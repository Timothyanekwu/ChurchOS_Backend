import Role from '../../models/sup_model/Role.js';

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin/SuperAdmin)
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({}).populate('permissions');
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
