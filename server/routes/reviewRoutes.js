import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByTarget,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";

import authMiddleware  from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);
router.get("/", getAllReviews);
router.get("/:reviewFor", getReviewsByTarget);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
