import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); 
import express from 'express';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import connectDB from "./config/db.js";

import bikeRoutes from "./routes/bikeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// import disputeCommentRoutes from "./routes/disputeCommentRoutes.js";


const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(morgan("dev"));

app.use("/api/bikes", bikeRoutes);
// app.use("/api/disputes", disputeCommentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/review", reviewRoutes);

const PORT = process.env.PORT || 5000;
console.log("ENV TEST:", process.env.RAZORPAY_KEY_ID);
console.log(process.env.JWT_SECRET);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});