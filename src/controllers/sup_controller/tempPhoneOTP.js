export const sendPhoneOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this phone number' });
    }

    // Generate Phone OTP using the model method we added
    const otp = user.generatePhoneOTP();
    await user.save({ validateBeforeSave: false });

    // Send SMS
    const message = `Your ChurchOS OTP is: ${otp}`;
    
    try {
      await sendSMS({
        to: user.phoneNumber,
        message: message
      });

      res.status(200).json({ success: true, data: 'OTP sent to phone' });
    } catch (error) {
      console.error('SMS Send Error:', error);
      user.phoneOtp = undefined;
      user.phoneOtpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // In development, return OTP for testing
      if (process.env.NODE_ENV === 'development') {
         return res.status(500).json({ 
           success: false, 
           message: 'SMS could not be sent (Mocking)',
           mockData: { otp }
         });
      }

      return res.status(500).json({ success: false, message: 'SMS could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide phone number and OTP' });
    }

    // Hash OTP to compare
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Find user with matching verified OTP
    const user = await User.findOne({
      phoneNumber,
      phoneOtp: hashedOTP,
      phoneOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark phone as verified and clear OTP
    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Phone number verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
