import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/status", protect, updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);
router.delete("/:id", protect, deleteBooking);

export default router;
