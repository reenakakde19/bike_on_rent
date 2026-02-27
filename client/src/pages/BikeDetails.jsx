// BikeDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import scooty from "../assets/scooty.png";

const BikeDetails = () => {
  const { bikeId } = useParams();
  const navigate = useNavigate();

  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/bikes/${bikeId}`
        );

        setBike(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, [bikeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F0FDFA]">
        Loading bike details...
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        Bike not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-white to-[#E6FFFA] px-6 md:px-16 py-20">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-10"
        >
          <img
            src={scooty}
            alt={bike.bikeName}
            className="w-full h-96 object-contain"
          />
        </motion.div>

        {/* RIGHT SIDE DETAILS */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl font-bold text-[#0F172A]">
            {bike.bikeName}
          </h1>

          <p className="text-gray-500 text-lg">
            {bike.brand} {bike.model} ({bike.year})
          </p>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            {bike.location?.city}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">

            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <IndianRupee size={16} />
                Per Day
              </span>
              <span className="font-bold text-[#20B2AA]">
                ₹{bike.pricing?.perDay}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                Per Hour
              </span>
              <span className="font-bold text-[#20B2AA]">
                ₹{bike.pricing?.perHour}
              </span>
            </div>
          </div>

          {/* Extra Info Section */}
          <div className="bg-[#F0FDFA] p-6 rounded-2xl">
            <h3 className="font-semibold text-lg mb-3">
              Bike Information
            </h3>

            <div className="grid grid-cols-2 gap-4 text-gray-600 text-sm">
              <div>
                <span className="font-medium">Bike Number:</span>
                <br />
                {bike.bikeNumber}
              </div>

              <div>
                <span className="font-medium">Type:</span>
                <br />
                {bike.bikeType}
              </div>

              <div>
                <span className="font-medium">Brand:</span>
                <br />
                {bike.brand}
              </div>

              <div>
                <span className="font-medium">Model:</span>
                <br />
                {bike.model}
              </div>
            </div>
          </div>

          {/* BOOK NOW BUTTON */}
          <button
            onClick={() => navigate(`/booking/${bike._id}`)}
            className="w-full bg-gradient-to-r from-[#20B2AA] to-[#178f89] text-white py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition shadow-xl"
          >
            Book Now 🚀
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default BikeDetails;