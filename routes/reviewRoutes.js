import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByTarget,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/", getAllReviews);
router.get("/:reviewFor", getReviewsByTarget);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
