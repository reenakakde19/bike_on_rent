import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/authmiddleware.js";
console.log("Booking Routes Loaded");
const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/my", authMiddleware, getMyBookings);
router.get("/:id", authMiddleware, getBookingById);
router.put("/:id/status", authMiddleware, updateBookingStatus);
router.put("/:id/cancel", authMiddleware, cancelBooking);
router.delete("/:id", authMiddleware, deleteBooking);
// router.post("/", authMiddleware, createBooking);

export default router;