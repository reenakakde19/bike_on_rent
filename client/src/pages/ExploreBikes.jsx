// ExploreBikes.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import scooty from "../assets/scooty.png";

const ExploreBikes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const cityFilter = queryParams.get("city");

useEffect(() => {
  const fetchBikes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bikes");

      // Handle different backend response structures safely
      let bikesData = [];

      if (Array.isArray(res.data)) {
        bikesData = res.data;
      } else if (Array.isArray(res.data.data)) {
        bikesData = res.data.data;
      } else if (res.data.data?.bikes) {
        bikesData = res.data.data.bikes;
      }

      // Optional: Show only approved bikes (if your schema has adminStatus)
      bikesData = bikesData.filter(
        (bike) =>
          !bike.adminStatus || bike.adminStatus === "approved"
      );

      // City filter
      if (cityFilter) {
        bikesData = bikesData.filter(
          (bike) =>
            bike.location?.city?.toLowerCase() ===
            cityFilter.toLowerCase()
        );
      }

      setBikes(bikesData);

    } catch (error) {
      console.error("Error fetching bikes:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchBikes();
}, [cityFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FDFA]">
        Loading bikes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] to-white px-6 md:px-16 py-20">

      {/* HEADER */}
      <div className="mb-14 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A]">
          Explore Available <span className="text-[#20B2AA]">Bikes</span>
        </h1>
        <p className="mt-4 text-gray-600">
          Find the perfect ride near you 🚲
        </p>
      </div>

      {/* GRID */}
      {bikes.length === 0 ? (
        <div className="text-center text-gray-500">
          No bikes available in this city.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          {bikes.map((bike, index) => (
            <motion.div
              key={bike._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/bikes/${bike._id}`)}
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={scooty}
                  alt={bike.bikeName}
                  className="w-full h-60 object-contain bg-[#F0FDFA] p-6 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 right-4 bg-[#20B2AA] text-white text-sm px-4 py-1 rounded-full shadow">
                  ₹{bike.pricing?.perDay}/day
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  {bike.bikeName}
                </h2>

                <p className="text-gray-500 mt-1">
                  {bike.brand} {bike.model}
                </p>

                <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                  <MapPin size={16} />
                  {bike.location?.city}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/bikes/${bike._id}`);
                  }}
                  className="mt-6 w-full bg-[#20B2AA] text-white py-3 rounded-full hover:bg-[#178f89] transition shadow-md"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreBikes;