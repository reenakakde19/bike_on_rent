import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bike",
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bookingTime: {
    start: Date,
    end: Date
  },

  durationType: {
    type: String,
    enum: ["hour", "day"]
  },

  amount: {
    total: Number,
    platformFee: Number,
    ownerEarning: Number
  },

  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "ongoing",
      "completed",
      "cancelled",
      "disputed"
    ],
    default: "pending"
  },

  otpForHandover: String,

  cancellationReason: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Booking", BookingSchema);
