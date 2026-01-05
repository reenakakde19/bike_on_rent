import express from 'express';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import bikeRoutes from "./routes/bikeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import userRoutes from "./routes/userRoutes.js"


dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(
    cors({
        origin: process.env.origin,
        credentials:true,
    })
);

app.use(morgan("dev"));

app.use("/api/bikes", bikeRoutes);
app.use("/api/disputes", disputeCommentRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/review", reviewRoutes);



const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});