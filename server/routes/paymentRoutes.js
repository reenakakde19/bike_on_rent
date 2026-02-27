import express from "express";
import authMiddleware from "../middleware/authmiddleware.js";
import {
  createPaymentOrder,
  verifyPayment
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createPaymentOrder);
router.post("/verify", authMiddleware, verifyPayment);

export default router;
