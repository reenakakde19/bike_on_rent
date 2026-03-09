import express from "express";
import multer from "multer";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  uploadBookingDocs,
  acceptBooking,
  rejectBooking
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/authmiddleware.js";
import { upload } from "../middleware/upload.js";

console.log("Booking Routes Loaded");
const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/my", authMiddleware, getMyBookings);
router.get("/:id", authMiddleware, getBookingById);
router.put("/:id/status", authMiddleware, updateBookingStatus);
router.put("/:id/cancel", authMiddleware, cancelBooking);
router.delete("/:id", authMiddleware, deleteBooking);
router.get("/accept/:bookingId", acceptBooking);
router.get("/reject/:bookingId", rejectBooking);

// document upload used during booking flow
router.post(
  "/upload-docs",
  authMiddleware,
  upload.fields([
    { name: "aadharCard", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
  ]),
  uploadBookingDocs
);

export default router;