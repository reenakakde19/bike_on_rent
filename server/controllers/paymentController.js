import dotenv from "dotenv";
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Razorpay = require("razorpay");

import Booking from "../models/booking.js";
import sendEmail from "../utils/sendEmail.js";
import Payment from "../models/payment.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// CREATE ORDER
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const options = {
      amount: booking.amount.total * 100,
      currency: "INR",
      receipt: `booking_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {

    console.log("VERIFY PAYMENT API HIT");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // prevent duplicate payments
    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingPayment) {
      return res.json({
        success: true,
        message: "Payment already verified",
      });
    }

    // SAVE PAYMENT
    const payment = await Payment.create({
      booking: bookingId,
      user: booking.renter,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: booking.amount.total,
      method: "upi",
      status: "success",
      paymentDate: new Date(),
    });

    console.log("PAYMENT SAVED:", payment);

   // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "confirmed" },
      { new: true }
    ).populate("owner");

    // SEND EMAIL TO BIKE OWNER
    const owner = updatedBooking.owner;

const acceptUrl = `http://localhost:5000/api/bookings/accept/${bookingId}`;
const rejectUrl = `http://localhost:5000/api/bookings/reject/${bookingId}`;

await sendEmail(
  owner.email,
  "New Bike Booking Request",
  "You have received a new bike booking request",
  `
  <div style="font-family:Arial;padding:20px;background:#f5f5f5">

    <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:8px">

      <h2 style="color:#333">🚴 BikeOnRent</h2>

      <p>Hello <b>${owner.fullName}</b>,</p>

      <p>Your bike has received a new booking request.</p>

      <p><b>Booking ID:</b> ${bookingId}</p>
      <p><b>Amount Paid:</b> ₹${booking.amount.total}</p>

      <p>Please confirm the booking:</p>

      <div style="margin-top:20px">

        <a href="${acceptUrl}"
        style="background:#28a745;color:white;padding:12px 18px;
        text-decoration:none;border-radius:6px;margin-right:10px;">
        Accept Booking
        </a>

        <a href="${rejectUrl}"
        style="background:#dc3545;color:white;padding:12px 18px;
        text-decoration:none;border-radius:6px;">
        Reject Booking
        </a>

      </div>

      <p style="margin-top:30px;color:#777">
      Thank you for using BikeOnRent 🚴
      </p>

    </div>

  </div>
`
);
    res.json({
      success: true,
      message: "Payment verified and email sent",
    });

  } catch (err) {

    console.error("VERIFY ERROR:", err);

    res.status(500).json({
      message: err.message,
    });

  }
};