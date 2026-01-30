import User from '../../models/sup_model/User.js';
import Role from '../../models/sup_model/Role.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../../utils/sendEmail.js';
import sendSMS from '../../utils/sendSMS.js';

// @desc    Register new user
// @route   POST /auth/register
// @access  Public

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;
    console.log('Register attempt:', { name, email, phoneNumber, roleName: role });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Role Assignment for Public Registration (Strict)
    // Ignore req.body.role for security unless explicitly handled for invites later.
    // Default to 'Super Admin' as per new requirement.
    const defaultRoleName = 'Super Admin';
    let userRole = await Role.findOne({ name: defaultRoleName });
    
    // Auto-create role if it doesn't exist (Resilience fix)
    if (!userRole) {
         console.warn(`Default role '${defaultRoleName}' missing. Auto-creating...`);
         userRole = await Role.create({
            name: defaultRoleName,
            description: 'Auto-created Super Admin role',
            permissions: [] // Start with empty permissions, admin needs to re-seed or configure
         });
    }

    console.log('Creating user with default role:', defaultRoleName);
    // Create user
    const user = await User.register({ name, email, password, role: userRole._id, phoneNumber });
    console.log('User created:', user._id);

    // Generate tokens
    console.log('Generating tokens...');
    const { accessToken, refreshToken } = User.generateTokens(user._id);
    console.log('Tokens generated successfully');

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.login(email, password);

    // Generate tokens
    const { accessToken, refreshToken } = User.generateTokens(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Please provide refresh token' });
    }

    const decoded = User.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Generate new access token only
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /auth/delete/:id
// @access  Private (Self or Admin)
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    await User.deleteUser(id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send email verification
// @route   POST /auth/send-email-verification
// @access  Public
export const sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    // Get token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verifyUrl = `${req.protocol}://${req.get(
      'host'
    )}/auth/verify-email?token=${verificationToken}`;

    const message = `Please verify your email via this button/link: \n\n ${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
      console.error(error);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // In development, return the token for testing if email fails
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          success: false, 
          message: 'Email could not be sent (Mocking)',
          mockData: { verificationToken }
        });
      };
      
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email
// @route   POST /auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body; // Or req.query.token depending on implementation

    if (!token) {
       return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Hash token to match stored hash
    const verificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP
// @route   POST /auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    const message = `Your OTP is: ${otp}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your OTP Code',
        message,
      });

      res.status(200).json({ success: true, data: 'OTP sent' });
    } catch (error) {
      console.error(error);
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });

       // In development, return the OTP for testing if email fails
       if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          success: false, 
          message: 'Email could not be sent (Mocking)',
          mockData: { otp }
        });
      };

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    // Hash OTP to compare
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP (optional: or keep until used for login?)
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    console.log(req)

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please make a PUT request to: \n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
      console.error(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          success: false, 
          message: 'Email could not be sent (Mocking)',
          mockData: { resetToken }
        });
      };

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body; // or req.query.token? adhering to user request POST /api/auth/reset-password

    // The user might send token in body or query. Let's check body first as it's a POST.
    if (!token || !newPassword) {
         return res.status(400).json({  success: false, message: 'Please provide token and new password' });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new tokens? Or just response success?
    // Usually good to log them in directly
    const { accessToken, refreshToken } = User.generateTokens(user._id);

    res.status(200).json({
      success: true,
      data: {
          accessToken,
          refreshToken,
          message: 'Password updated successfully'
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change Password
// @route   POST /auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // User is available from protect middleware (req.user)
    // We need to fetch password explicitly as it is select: false
    const user = await User.findById(req.user.id).select('+password');


    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

