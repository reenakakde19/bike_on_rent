import express from "express";
import {
  createBike,
  getAllBikes,
  getBikeById,
  updateBike,
  deleteBike
} from "../controllers/bikeController.js";

import authMiddleware  from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBike);
router.get("/", getAllBikes);
router.get("/:id", getBikeById);
router.put("/:id", authMiddleware, updateBike);
router.delete("/:id", authMiddleware, deleteBike);

export default router;