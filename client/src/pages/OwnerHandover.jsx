import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const OwnerHandover = () => {

  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchBooking = async () => {

      try {

        const res = await axios.get(
          `http://localhost:5000/api/bookings/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setBooking(res.data);

      } catch (err) {
        console.error(err);
      }

    };

    fetchBooking();

  }, [id, token]);


  const verifyOTP = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/bookings/verify-otp",
        {
          bookingId: id,
          otp
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(res.data.message);

    } catch (err) {

      setMessage("Invalid OTP");

    }

  };


  if (!booking) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading booking...
      </div>
    );
  }


  return (

    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <div
        className="text-white text-center py-10 shadow-lg"
        style={{ backgroundColor: "#20B2AA" }}
      >
        <h1 className="text-3xl font-bold">
          Bike Handover Verification
        </h1>
        <p className="opacity-90 mt-2">
          Verify OTP before giving bike to rider
        </p>
      </div>


      <div className="max-w-5xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-xl p-8">


          {/* Rider + Bike */}

          <div className="grid md:grid-cols-2 gap-8">

            {/* Rider */}

            <div className="bg-gray-50 p-6 rounded-lg border">

              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: "#20B2AA" }}
              >
                Rider Information
              </h3>

              <p><b>Name:</b> {booking?.renter?.fullName}</p>
              <p><b>Email:</b> {booking?.renter?.email}</p>
              <p><b>Phone:</b> {booking?.renter?.phone}</p>

            </div>


            {/* Bike */}

            <div className="bg-gray-50 p-6 rounded-lg border">

              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: "#20B2AA" }}
              >
                Bike Information
              </h3>

              <p><b>Bike:</b> {booking?.bike?.name}</p>
              <p><b>Model:</b> {booking?.bike?.model}</p>

              <p className="mt-2 font-semibold">
                Pickup Location
              </p>

              <p>{booking?.bike?.location?.addressLine}</p>
              <p>{booking?.bike?.location?.landmark}</p>
              <p>
                {booking?.bike?.location?.city} - {booking?.bike?.location?.pincode}
              </p>

            </div>

          </div>


          {/* Booking */}

          <div className="mt-8 bg-gray-50 p-6 rounded-lg border">

            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "#20B2AA" }}
            >
              Booking Details
            </h3>

            <p>
              <b>Start Date:</b>{" "}
              {new Date(booking.startDate).toDateString()}
            </p>

            <p>
              <b>End Date:</b>{" "}
              {new Date(booking.endDate).toDateString()}
            </p>

          </div>


          {/* OTP */}

          <div className="mt-8 text-center">

            <h3
              className="text-2xl font-semibold mb-4"
              style={{ color: "#20B2AA" }}
            >
              Verify Pickup OTP
            </h3>

            <input
              type="text"
              placeholder="Enter OTP from rider"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-3 rounded-lg w-full mb-4"
            />

            <button
              onClick={verifyOTP}
              className="px-8 py-3 text-white rounded-lg shadow-lg hover:scale-105 transition"
              style={{ backgroundColor: "#20B2AA" }}
            >
              Verify OTP & Hand Over Bike
            </button>

            {message && (

              <p className="mt-4 font-semibold text-green-600">
                {message}
              </p>

            )}

          </div>

        </div>

      </div>

    </div>
  );

};

export default OwnerHandover;