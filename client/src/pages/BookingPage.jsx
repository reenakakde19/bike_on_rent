import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, IndianRupee } from "lucide-react";

const BookingPage = () => {
  const { bikeId } = useParams();
  const [bike, setBike] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bikes/${bikeId}`);
        setBike(res.data.data);
      } catch (err) {
        console.error("Error fetching bike:", err);
        setBike(null);
      }
    })();
  }, [bikeId]);

  const calculateAmount = () => {
    if (!startDate || !endDate || !bike) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const amount = diffDays * bike.pricing.perDay;

    setTotalAmount(amount);
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      // 1️⃣ Create booking (match backend field names)
      const bookingRes = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          bike: bikeId,
          start: startDate,
          end: endDate,
          durationType: "day", // or "hour"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bookingId = bookingRes.data.booking._id;

      // 2️⃣ Create Razorpay order
      const orderRes = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, key } = orderRes.data;

      const options = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: "BikeOnRent",
        description: "Bike Booking Payment",
        handler: async (response) => {
          // 3️⃣ Verify payment
          await axios.post(
            "http://localhost:5000/api/payment/verify",
            { ...response, bookingId, amount },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert("🎉 Booking Confirmed Successfully!");
        },
        theme: { color: "#20B2AA" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment Failed");
    }
  };

  if (!bike) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-white to-[#E6FFFA] flex justify-center items-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-[#0F172A]">
          Confirm Your Booking 🚀
        </h2>

        <div className="text-center text-gray-600">
          {bike.bikeName} - ₹{bike.pricing.perDay} / day
        </div>

        {/* Date Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              <Calendar size={16} className="inline mr-2" /> Start Date
            </label>
            <input
              type="date"
              className="w-full border rounded-xl p-3 mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              <Calendar size={16} className="inline mr-2" /> End Date
            </label>
            <input
              type="date"
              className="w-full border rounded-xl p-3 mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={calculateAmount}
            className="w-full bg-[#20B2AA] text-white py-3 rounded-xl font-semibold"
          >
            Calculate Price
          </button>
        </div>

        {totalAmount > 0 && (
          <div className="bg-[#F0FDFA] p-5 rounded-2xl flex justify-between items-center">
            <span className="flex items-center gap-2">
              <IndianRupee size={18} /> Total Amount
            </span>
            <span className="text-xl font-bold text-[#20B2AA]">
              ₹{totalAmount}
            </span>
          </div>
        )}

        <button
          onClick={handlePayment}
          className="w-full bg-gradient-to-r from-[#20B2AA] to-[#178f89] text-white py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition shadow-xl"
        >
          Proceed to Pay 💳
        </button>
      </motion.div>
    </div>
  );
};

export default BookingPage;