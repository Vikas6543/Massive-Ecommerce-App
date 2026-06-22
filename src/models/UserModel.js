import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password in queries
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    // ✅ Email Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,

    // ✅ OTP
    otp: String,
    otpExpiry: Date,
    otpPurpose: {
      type: String,
      enum: ["email-verification", "password-reset", "login"],
    },

    // ✅ Password Reset
    passwordResetToken: String,
    passwordResetExpiry: Date,

    // ✅ Refresh Token
    refreshToken: {
      type: String,
      select: false,
    },

    // ✅ Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },

    // ✅ OAuth
    googleId: {
      type: String,
      default: null,
    },

    // ✅ Addresses (for orders later)
    addresses: [
      {
        label: String, // home, work, etc
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
        isDefault: { type: Boolean, default: false },
      },
    ],

    // ✅ Wishlist (reference to products later)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // ✅ Last Login
    lastLogin: Date,

    // ✅ Login Security
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },

    // ✅ Active Sessions
    sessions: [
      {
        refreshToken: { type: String, required: true },
        deviceInfo: {
          browser: String,
          os: String,
          platform: String,
        },
        ipAddress: String,
        lastActive: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt auto added
  },
);

// ✅ Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ✅ Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Check if OTP is expired
userSchema.methods.isOtpExpired = function () {
  return Date.now() > this.otpExpiry;
};

// ✅ Check if reset token is expired
userSchema.methods.isResetTokenExpired = function () {
  return Date.now() > this.passwordResetExpiry;
};

// ✅ Check if account is locked
userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

// ✅ Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // if lock has expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
    return await this.save();
  }

  this.loginAttempts += 1;

  // lock after 5 attempts for 30 minutes
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }

  return await this.save();
};

// ✅ Reset login attempts on success
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  // return await this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
