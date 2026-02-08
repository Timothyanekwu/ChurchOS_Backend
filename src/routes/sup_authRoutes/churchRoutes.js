import express from "express";
import { protect } from "../../middleware/sup_middleware/authMiddleware.js";
import {
  registerChurch,
  validateChurch,
  getChurch,
  updateChurch,
  getRegistrationStatus,
  sendEmailVerification,
  confirmEmail,
  resendEmail,
  sendPhoneOTP,
  confirmPhoneOTP,
  resendOTP,
  assignSuperAdmin,
  getAdmins,
  createHQBranch,
  createBranch,
  getBranches,
  cancelRegistration,
  restartRegistration,
} from "../../controllers/sup_controller/churchController.js";

const router = express.Router();

// --- Onboarding & Validation ---
router.post("/register", protect, registerChurch);
router.post("/validate", validateChurch);
router.get("/registration/status", protect, getRegistrationStatus);
router.post("/registration/cancel", protect, cancelRegistration);
router.post("/registration/restart", protect, restartRegistration);

// --- Email Verification ---
router.post("/verify-email/send", protect, sendEmailVerification);
router.post("/verify-email/confirm", protect, confirmEmail);
router.post("/resend-email", protect, resendEmail);

// --- Phone / OTP Verification ---
router.post("/verify-phone/send", protect, sendPhoneOTP);
router.post("/verify-phone/confirm", protect, confirmPhoneOTP);
router.post("/resend-otp", protect, resendOTP);

// --- Admin management ---
router.post("/:id/assign-super-admin", protect, assignSuperAdmin);
router.get("/:id/admins", protect, getAdmins);

// --- Branch management ---
router.post("/:id/branches/hq", protect, createHQBranch);
router.post("/:id/branches", protect, createBranch);
router.get("/:id/branches", protect, getBranches);

// --- Church Entity CRUD ---
router.route("/:id").get(protect, getChurch).put(protect, updateChurch);

export default router;
