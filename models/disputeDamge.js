const DisputeSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },

  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  description: String,

  images: [String],

  status: {
    type: String,
    enum: ["open", "under_review", "resolved"]
  },

  resolution: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Dispute", DisputeSchema);
