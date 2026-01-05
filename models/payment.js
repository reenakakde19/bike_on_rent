const PaymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },

  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  transactionId: String,

  amount: Number,

  method: {
    type: String,
    enum: ["upi", "card", "wallet"]
  },

  status: {
    type: String,
    enum: ["initiated", "success", "failed"],
    default: "initiated"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Payment", PaymentSchema);
