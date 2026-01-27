import { register, login, refresh, getMe, deleteAccount,  sendEmailVerification,
  verifyEmail,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../../controllers/sup_controller/authController.js';
import { protect } from '../../middleware/sup_middleware/authMiddleware.js';
import express from 'express';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.delete('/delete/:id', protect, deleteAccount);

router.post('/send-email-verification', sendEmailVerification);
router.post('/verify-email', verifyEmail);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);

export default router;
