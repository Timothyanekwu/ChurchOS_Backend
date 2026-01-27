import express from 'express';
import { createUser, getUsers } from '../../controllers/sup_controller/userController.js';
import { protect, authorize } from '../../middleware/sup_middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('user.create'), createUser)
  .get(protect, authorize('user.read'), getUsers);

export default router;
