import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      city: {
        type: String,
      },
      address: {
        type: String,
      },
    },

    // ✅ Account Status
    isBlocked: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ✅ OTP Fields
    emailOTP: String,
    emailOTPExpiry: Date,

    // ✅ Password Reset
    passwordResetToken: String,
    passwordResetExpiry: Date,

    // ✅ Rating System
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    // ✅ Wallet
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ Geo Index
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
