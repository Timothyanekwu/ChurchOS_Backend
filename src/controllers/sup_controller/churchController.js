import Church from "../../models/sup_model/Church.js";
import User from "../../models/sup_model/User.js";
import Branch from "../../models/sup_model/Branch.js";
import Role from "../../models/sup_model/Role.js";
import crypto from "crypto";
import sendEmail from "../../utils/sendEmail.js";

// @desc    Register a new church organization
// @route   POST /api/church/register
// @access  Private (User must be logged in)
export const registerChurch = async (req, res) => {
  try {
    const { church: churchData, contact, address, settings } = req.body;

    // 1. Check if user already has a church?
    // Implementation choice: Can a user own multiple churches?
    // Usually one user -> one church context for MVP.
    const user = await User.findById(req.user.id);
    if (user.church) {
      return res.status(400).json({
        success: false,
        message: "User is already associated with a church organization",
      });
    }

    // 2. Validate Church Name Uniqueness
    const existingChurch = await Church.findOne({ name: churchData.name });
    if (existingChurch) {
      return res
        .status(400)
        .json({ success: false, message: "Church name already registered" });
    }

    // 3. Create Church
    const newChurch = await Church.create({
      ...churchData,
      contact,
      address,
      settings,
      createdBy: user._id,
    });

    // 4. Link User to Church
    user.church = newChurch._id;
    await user.save();

    res.status(201).json({
      success: true,
      data: newChurch,
      message: "Church organization registered successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate church details (e.g. check name availability)
// @route   POST /api/church/validate
// @access  Public (or Private?) - typically used during onboarding
export const validateChurch = async (req, res) => {
  try {
    const { name } = req.body;
    if (name) {
      const existing = await Church.findOne({ name });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Church name is taken" });
      }
    }
    res.status(200).json({ success: true, message: "Valid" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Church Details
// @route   GET /api/church/:id
// @access  Private
export const getChurch = async (req, res) => {
  try {
    const church = await Church.findById(req.params.id);
    if (!church) {
      return res
        .status(404)
        .json({ success: false, message: "Church not found" });
    }
    res.status(200).json({ success: true, data: church });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Church Details
// @route   PUT /api/church/:id
// @access  Private (Admin only)
export const updateChurch = async (req, res) => {
  try {
    let church = await Church.findById(req.params.id);
    if (!church) {
      return res
        .status(404)
        .json({ success: false, message: "Church not found" });
    }

    // Verify ownership/permissions (TODO: RBAC check)
    if (
      church.createdBy.toString() !== req.user.id &&
      req.user.role.name !== "Super Admin"
    ) {
      // Basic check, implement robust RBAC later
      // For now allow if user is creator or generic check passes
    }

    church = await Church.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: church });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Registration Status
// @route   GET /api/church/registration/status
// @access  Private
export const getRegistrationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("church");
    if (!user.church) {
      return res.status(200).json({ success: true, status: "NOT_REGISTERED" });
    }
    return res
      .status(200)
      .json({ success: true, status: "COMPLETED", churchId: user.church._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Email Verification Wrappers ---

// @desc    Send email verification
// @route   POST /api/church/verify-email/send
export const sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("church");
    const church = user.church;

    if (!church) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No church associated with this user",
        });
    }

    if (church.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    const verificationToken = church.getEmailVerificationToken();
    await church.save({ validateBeforeSave: false });

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/church/verify-email/confirm?token=${verificationToken}`;
    const message = `Please verify your church account email: \n\n ${verifyUrl}`;

    await sendEmail({
      email: church.contact.email,
      subject: "Church Email Verification",
      message,
    });

    res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm email verification
// @route   POST /api/church/verify-email/confirm
export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ success: false, message: "Missing token" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const church = await Church.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!church)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    church.isEmailVerified = true;
    church.emailVerificationToken = undefined;
    church.emailVerificationExpire = undefined;
    await church.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend email verification
// @route   POST /api/church/resend-email
export const resendEmail = async (req, res) => {
  return sendEmailVerification(req, res);
};

// --- Phone / OTP Verification Wrappers ---

// @desc    Send phone verification OTP
// @route   POST /api/church/verify-phone/send
export const sendPhoneOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("church");
    const church = user.church;

    if (!church) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No church associated with this user",
        });
    }

    const otp = church.generatePhoneOTP();
    await church.save({ validateBeforeSave: false });

    // Mocking SMS for now
    console.log(`[SMS MOCK] To: ${church.contact.phone}, OTP: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent to phone",
      mockData: process.env.NODE_ENV === "development" ? { otp } : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm phone verification
// @route   POST /api/church/verify-phone/confirm
export const confirmPhoneOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp)
      return res.status(400).json({ success: false, message: "Missing OTP" });

    const user = await User.findById(req.user.id).populate("church");
    const church = user.church;

    if (!church) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No church associated with this user",
        });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (church.phoneOtp !== hashedOTP || church.phoneOtpExpire < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    church.isPhoneVerified = true;
    church.phoneOtp = undefined;
    church.phoneOtpExpire = undefined;
    await church.save();

    res
      .status(200)
      .json({ success: true, message: "Phone verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/church/resend-otp
export const resendOTP = async (req, res) => {
  return sendPhoneOTP(req, res);
};

// --- Admin Management ---

// @desc    Assign Super Admin to a church
// @route   POST /api/church/:id/assign-super-admin
export const assignSuperAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const churchId = req.params.id;

    const role = await Role.findOne({ name: "Super Admin" });
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.role = role._id;
    user.church = churchId;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Super Admin assigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admins of a church
// @route   GET /api/church/:id/admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ church: req.params.id }).populate("role");
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Branch Management ---

// @desc    Create HQ Branch
// @route   POST /api/church/:id/branches/hq
export const createHQBranch = async (req, res) => {
  try {
    const churchId = req.params.id;
    const { name, address, contact } = req.body;

    // Check if HQ already exists for this church
    const existingHQ = await Branch.findOne({ church: churchId, isHQ: true });
    if (existingHQ)
      return res
        .status(400)
        .json({ success: false, message: "HQ Branch already exists" });

    const branch = await Branch.create({
      name,
      church: churchId,
      isHQ: true,
      address,
      contact,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a generic Branch
// @route   POST /api/church/:id/branches
export const createBranch = async (req, res) => {
  try {
    const churchId = req.params.id;
    const { name, address, contact, isHQ } = req.body;

    // Optional: Check permissions (Admin only)

    const branch = await Branch.create({
      name,
      church: churchId,
      isHQ: isHQ || false,
      address,
      contact,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get branches of a church
// @route   GET /api/church/:id/branches
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ church: req.params.id });
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Registration Control ---

// @desc    Cancel registration
// @route   POST /api/church/registration/cancel
export const cancelRegistration = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.church) {
      // Potentially delete the church entity if it was incomplete?
      // For now just unlink
      user.church = undefined;
      await user.save();
    }
    res.status(200).json({ success: true, message: "Registration cancelled" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restart registration
// @route   POST /api/church/registration/restart
export const restartRegistration = async (req, res) => {
  // Similar to cancel, but maybe we keep user account
  return cancelRegistration(req, res);
};
