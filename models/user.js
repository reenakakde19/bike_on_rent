import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true
  },

  phone: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  location: {
    city: String,
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: "2dsphere"
      }
    }
  },

  identityVerification: {
    drivingLicense: {
      number: String,
      verified: { type: Boolean, default: false }
    },
    aadhaar: {
      number: String,
      verified: { type: Boolean, default: false }
    }
  },

  isBlocked: { type: Boolean, default: false },

  rating: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },

  walletBalance: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", UserSchema);
