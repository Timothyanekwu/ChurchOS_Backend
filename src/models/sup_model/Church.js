import mongoose from "mongoose";
import crypto from "crypto";
import otpGenerator from "otp-generator";

const churchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a church name"],
      trim: true,
      unique: true,
    },
    website: {
      type: String,
      trim: true,
    },
    foundedYear: {
      type: Number,
    },
    logoUrl: {
      type: String,
    },
    contact: {
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please add a valid email",
        ],
      },
      phone: {
        type: String,
      },
    },
    address: {
      country: {
        type: String,
        required: [true, "Please provide country"],
      },
      state: {
        type: String,
        required: [true, "Please provide state"],
      },
      city: {
        type: String,
      },
      street: {
        type: String,
      },
      postalCode: {
        type: String,
      },
    },
    settings: {
      timezone: {
        type: String,
        default: "UTC",
      },
      currency: {
        type: String,
        default: "USD",
      },
      language: {
        type: String,
        default: "en",
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    phoneOtp: String,
    phoneOtpExpire: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Method: Generate Email Verification Token
churchSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to field
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expire (e.g., 24 hours)
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Method: Generate Phone OTP
churchSchema.methods.generatePhoneOTP = function () {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  // Hash OTP and set to phoneOtp field
  this.phoneOtp = crypto.createHash("sha256").update(otp).digest("hex");

  // Set expire (e.g., 10 minutes)
  this.phoneOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

const Church = mongoose.model("Church", churchSchema);

export default Church;
