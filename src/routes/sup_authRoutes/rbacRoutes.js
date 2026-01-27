import express from 'express';
import { getRoles } from '../../controllers/sup_controller/roleController.js';
import { getPermissions } from '../../controllers/sup_controller/permissionController.js';
import { protect } from '../../middleware/sup_middleware/authMiddleware.js';

const router = express.Router();

// Role routes - Read Only
router.route('/roles')
  .get(protect, getRoles);

// Permission routes - Read Only
router.route('/permissions')
  .get(protect, getPermissions);

export default router;
