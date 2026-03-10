import Booking from "../models/booking.js";
import Bike from "../models/bike.js";
import { setBikeAvailability } from "../utils/updateBikeAvailability.js";
import sendEmail from "../utils/sendEmail.js";
/* CREATE BOOKING */

import User from "../models/user.js";

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { bikeId, startDate, endDate, durationType } = req.body;

    // 1️ Auth Check
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 2️ Required Fields
    if (!bikeId || !startDate || !endDate || !durationType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 3️ Check User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️ KYC Verification Check
    // if (!user.documents?.isVerified) {
    //   return res.status(400).json({
    //     message: "Please complete KYC verification before booking",
    //   });
    // }

    // 5️ Check Bike
    const bikeData = await Bike.findById(bikeId);
    if (!bikeData) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // 6️ Date Validation
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // 7️ Overlap Check (Block all active + pending bookings)
    const conflict = await Booking.findOne({
      bike: bikeId,
      bookingStatus: {
        $in: [
          "PENDING_VENDOR_APPROVAL",
          "CONFIRMED",
          "ACTIVE_RIDE",
        ],
      },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (conflict) {
      return res.status(400).json({
        message: "Bike already booked for selected time",
      });
    }

    // 8️ Price Calculation
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    let totalAmount = 0;

    if (durationType === "day") {
      totalAmount = days * bikeData.pricing.perDay;
    } else if (durationType === "hour") {
      totalAmount = hours * bikeData.pricing.perHour;
    } else {
      return res.status(400).json({ message: "Invalid duration type" });
    }

    const platformFee = totalAmount * 0.1;
    const vendorEarning = totalAmount - platformFee;

    // 9️ Create Booking
    const booking = await Booking.create({
      renter: userId,
      owner: bikeData.owner,
      bike: bikeId,
      startDate: start,
      endDate: end,
      durationType,
      amount: {
        total: totalAmount,
        platformFee,
        vendorEarning,
      },
      paymentStatus: "PENDING",
      bookingStatus: "PENDING_VENDOR_APPROVAL",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });

  } catch (error) {
    console.error("CreateBooking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
/* GET MY BOOKINGS */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await Booking.find({
      $or: [{ renter: userId }, { owner: userId }]
    })
      .populate("bike")
      .populate("renter", "fullName")
      .populate("owner", "fullName")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* GET BOOKING BY ID */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("bike")
      .populate("owner", "fullName")
      .populate("renter", "fullName");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* UPDATE BOOKING STATUS */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // owner or admin only
    if (
      booking.owner.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;

    if (status === "confirmed" || status === "ongoing") {
      await setBikeAvailability(booking.bike, false);
    }

    if (status === "completed" || status === "cancelled") {
      await setBikeAvailability(booking.bike, true);
    }

    await booking.save();

    res.json({
      message: "Booking status updated",
      booking
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* CANCEL BOOKING */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.renter.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only renter can cancel" });
    }

    if (booking.status === "ongoing" || booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel ongoing/completed ride" });
    }

    booking.status = "cancelled";
    booking.cancellationReason = req.body.reason;

    await booking.save();

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* DELETE BOOKING */
export const deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   UPLOAD BOOKING DOCUMENTS
   (used by BookingPage client)
=============================== */
export const uploadBookingDocs = async (req, res) => {
  try {
    // expect aadharCard and drivingLicense fields
    if (!req.files || !req.files.aadharCard || !req.files.drivingLicense) {
      return res.status(400).json({ message: "Both documents are required" });
    }

    const aadharFile = req.files.aadharCard[0];
    const licenseFile = req.files.drivingLicense[0];

    // returning accessible paths (static middleware serves /uploads)
    const aadharUrl = `${req.protocol}://${req.get("host")}/uploads/${aadharFile.filename}`;
    const licenseUrl = `${req.protocol}://${req.get("host")}/uploads/${licenseFile.filename}`;

    return res.json({ aadharUrl, licenseUrl });
  } catch (err) {
    console.error("uploadBookingDocs error", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: "APPROVED" },
      { new: true }, 
    )
    .populate("renter")
      .populate({
    path: "owner",
    select: "fullName email phone"
  })
    .populate("bike");

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    const renter = booking.renter;

    const pickupUrl = `http://localhost:5173/pickup/${booking._id}`;

    // SEND EMAIL TO RENTER
    await sendEmail(
      renter.email,
      "Booking Confirmed 🚴",
      "Your bike booking has been confirmed",
      `
      <div style="font-family:Arial;padding:20px;background:#f5f5f5">

        <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:8px">

          <h2 style="color:#333">🎉 Booking Confirmed</h2>

          <p>Hello <b>${renter.fullName}</b>,</p>

          <p>Your booking for the bike <b>${booking.bike.name}</b> has been <b>accepted by the owner</b>.</p>

          <p><b>Booking ID:</b> ${booking._id}</p>
          <p><b>Start Date:</b> ${new Date(booking.startDate).toDateString()}</p>
          <p><b>End Date:</b> ${new Date(booking.endDate).toDateString()}</p>

          <p>Please contact the owner for pickup details.</p>


           <a href="${pickupUrl}"
        style="
        background:#20B2AA;
        color:white;
        padding:12px 20px;
        text-decoration:none;
        border-radius:6px;
        font-weight:bold;
        display:inline-block;
        ">
        🚴 Go to Pickup Page
        </a>

          <p style="margin-top:20px;color:#777">
          Thank you for using <b>BikeOnRent 🚴</b>
          </p>

        </div>

      </div>
      `
    );

    // res.send("Booking accepted and renter notified by email");
    res.redirect(`http://localhost:5173/handover/${booking._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

export const rejectBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: "REJECTED" },
      { new: true }
    ).populate("renter");

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    const renter = booking.renter;

    await sendEmail(
      renter.email,
      "Booking Rejected",
      "Your booking was rejected",
      `
      <h2>Booking Rejected</h2>
      <p>Hello ${renter.fullName},</p>
      <p>Unfortunately the bike owner rejected your booking request.</p>
      `
    );

    res.send("Booking rejected and renter notified");

  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const generateOTP = async (req, res) => {

  try {

    const { bookingId } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000
      },
      { new: true }
    );

    res.json({
      message: "OTP Generated",
      otp
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

export const verifyOTP = async (req, res) => {

  try {

    const { bookingId, otp } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (booking.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    booking.rideStarted = true;
    booking.otp = null;

    await booking.save();

    res.json({
      message: "OTP Verified. Ride Started 🚴"
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

