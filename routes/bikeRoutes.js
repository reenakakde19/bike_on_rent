import express from "express";
import {
  createBike,
  getAllBikes,
  getBikeById,
  updateBike,
  deleteBike
} from "../controllers/bike.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createBike);
router.get("/", getAllBikes);
router.get("/:id", getBikeById);
router.put("/:id", protect, updateBike);
router.delete("/:id", protect, deleteBike);

export default router;
