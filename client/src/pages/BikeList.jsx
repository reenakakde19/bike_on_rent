// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const BookingPage = () => {
//   const { bikeId } = useParams();
//   const [bike, setBike] = useState(null);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   useEffect(() => {
//     const fetchBike = async () => {
//       const response = await axios.get(
//         `http://localhost:5000/api/bikes/${bikeId}`
//       );
//       setBike(response.data.data);
//     };

//     fetchBike();
//   }, [bikeId]);

//   if (!bike) {
//     return (
//       <div className="min-h-screen flex justify-center items-center">
//         Loading...
//       </div>
//     );
//   }

//   // Calculate number of days
//   const calculateDays = () => {
//     if (!startDate || !endDate) return 0;

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     const diffTime = end - start;
//     const diffDays = diffTime / (1000 * 3600 * 24);

//     return diffDays > 0 ? diffDays : 0;
//   };

//   const days = calculateDays();
//   const pricePerDay = bike.pricing?.perDay || 0;
//   const serviceFee = 99;
//   const totalPrice = days * pricePerDay + (days > 0 ? serviceFee : 0);

//   const handleBooking = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       await axios.post(
//         "http://localhost:5000/api/bookings",
//         {
//           bike: bikeId,
//           startDate,
//           endDate,
//           totalPrice
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       alert("Booking Confirmed 🎉");
//     } catch (error) {
//       alert("Booking failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white px-10 py-16">

//       <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

//         {/* LEFT SIDE - BIKE DETAILS */}
//         <div>
//           <img
//             src="https://images.unsplash.com/photo-1605559424843-9e4c228e3c4b"
//             alt="Bike"
//             className="w-full h-80 object-cover rounded-3xl shadow-xl"
//           />

//           <h2 className="text-3xl font-bold mt-6 text-teal-700">
//             {bike.bikeName}
//           </h2>

//           <p className="text-gray-500 mt-2">
//             {bike.brand} {bike.model}
//           </p>

//           <p className="text-gray-600 mt-2">
//             📍 {bike.location?.city}
//           </p>

//           <div className="mt-4 text-xl font-bold text-teal-600">
//             ₹{pricePerDay} / day
//           </div>
//         </div>

//         {/* RIGHT SIDE - BOOKING PANEL */}
//         <div className="bg-white p-8 rounded-3xl shadow-2xl sticky top-20 h-fit">

//           <h3 className="text-2xl font-semibold mb-6">
//             Select Dates
//           </h3>

//           <div className="space-y-4">

//             <div>
//               <label className="block text-sm mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="w-full border p-3 rounded-xl"
//               />
//             </div>

//             <div>
//               <label className="block text-sm mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="w-full border p-3 rounded-xl"
//               />
//             </div>

//           </div>

//           {/* PRICE BREAKDOWN */}
//           {days > 0 && (
//             <div className="mt-8 border-t pt-6 space-y-3 text-gray-700">

//               <div className="flex justify-between">
//                 <span>
//                   ₹{pricePerDay} × {days} days
//                 </span>
//                 <span>
//                   ₹{pricePerDay * days}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span>Service Fee</span>
//                 <span>₹{serviceFee}</span>
//               </div>

//               <div className="flex justify-between font-bold text-lg text-teal-600 border-t pt-3">
//                 <span>Total</span>
//                 <span>₹{totalPrice}</span>
//               </div>

//             </div>
//           )}

//           <button
//             onClick={handleBooking}
//             disabled={days <= 0}
//             className="mt-8 w-full bg-gradient-to-r from-teal-500 to-teal-700 text-white py-3 rounded-2xl hover:scale-105 transition disabled:opacity-50"
//           >
//             Confirm Booking
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingPage;
