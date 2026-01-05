import express from "express";
import {
  addComment,
  getCommentsByDispute
} from "../controllers/disputeComment.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:disputeId/comments", protect, addComment);
router.get("/:disputeId/comments", protect, getCommentsByDispute);

export default router;
