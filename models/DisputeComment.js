import mongoose from "mongoose";

const DisputeCommentSchema = new mongoose.Schema({
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dispute",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: {
    type: String,
    required: true
  },

  images: [String],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("DisputeComment", DisputeCommentSchema);
