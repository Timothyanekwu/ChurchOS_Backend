import Permission from '../../models/sup_model/Permission.js';

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private (Admin/SuperAdmin)
export const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({});
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
