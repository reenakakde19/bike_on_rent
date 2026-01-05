import Booking from "../models/booking.js";
import Bike from "../models/bike.js";
import { setBikeAvailability } from "../utils/updateBikeAvailability.js";

/* CREATE BOOKING */
export const createBooking = async (req, res) => {
  try {
    const renter = req.user.userId;
    const { bike, start, end, durationType } = req.body;

    const bikeData = await Bike.findById(bike);
    if (!bikeData || !bikeData.isAvailable) {
      return res.status(404).json({ message: "Bike not available" });
    }

    // Prevent overlapping bookings
    const conflict = await Booking.findOne({
      bike,
      status: { $in: ["confirmed", "ongoing"] },
      "bookingTime.start": { $lt: end },
      "bookingTime.end": { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({ message: "Bike already booked for this time" });
    }

    const hours = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60));
    const totalAmount =
      durationType === "day"
        ? bikeData.pricing.perDay
        : hours * bikeData.pricing.perHour;

    const platformFee = totalAmount * 0.1; // 10%
    const ownerEarning = totalAmount - platformFee;

    const booking = await Booking.create({
      bike,
      owner: bikeData.owner,
      renter,
      bookingTime: { start, end },
      durationType,
      amount: {
        total: totalAmount,
        platformFee,
        ownerEarning
      }
    });

    res.status(201).json({
      message: "Booking created",
      booking
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
