import razorpay from "../utils/razorpay.js";
import Booking from "../models/booking.js";
import crypto from "crypto";
import Payment from "../models/payment.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const options = {
      amount: booking.amount.total * 100, // paise
      currency: "INR",
      receipt: `booking_${bookingId}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Save payment
    await Payment.create({
      booking: bookingId,
      transactionId: razorpay_payment_id,
      amount: req.body.amount,
      method: "upi",
      status: "success"
    });

    // Confirm booking
    await Booking.findByIdAndUpdate(bookingId, {
      status: "confirmed"
    });

    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};