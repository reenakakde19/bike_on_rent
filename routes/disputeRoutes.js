import express from "express";
import {
  createDispute,
  getAllDisputes,
  getDisputeById,
  updateDispute,
  deleteDispute
} from "../controllers/dispute.controller.js";

import { protect, isAdmin } from "../middlewares/auth.middleware.js";
router.get("/my", protect, getMyDisputes);

const router = express.Router();

router.post("/", protect, createDispute);
router.get("/", protect, isAdmin, getAllDisputes);
router.get("/:id", protect, getDisputeById);
router.put("/:id", protect, isAdmin, updateDispute);
router.delete("/:id", protect, isAdmin, deleteDispute);

export default router;
