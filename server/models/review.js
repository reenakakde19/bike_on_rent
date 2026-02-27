import mongoose from "mongoose";
const ReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },

  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  reviewFor: {
    type: String,
    enum: ["user", "bike"]
  },

  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  comment: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Review", ReviewSchema);
