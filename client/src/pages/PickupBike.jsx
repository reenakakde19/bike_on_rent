import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PickupBike = () => {

  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {

    if (!id) return;

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
        setPageLoading(false);

      } catch (err) {
        console.error(err);
        setError("Failed to load booking details");
        setPageLoading(false);
      }
    };

    fetchBooking();

  }, [id, token]);


  const generateOTP = async () => {

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/bookings/generate-otp",
        { bookingId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOtp(res.data.otp);
      setLoading(false);

    } catch (err) {

      console.error(err);
      setError("Failed to generate OTP");
      setLoading(false);

    }

  };

  const copyOTP = () => {
    navigator.clipboard.writeText(otp);
    alert("OTP copied!");
  };


  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading booking details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        {error}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center items-center h-screen">
        Booking not found
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
          Bike Pickup Confirmation
        </h1>
        <p className="opacity-90 mt-2">
          Show OTP to owner to start your ride
        </p>
      </div>


      <div className="max-w-5xl mx-auto p-6">

        {/* MAIN CARD */}

        <div className="bg-white rounded-xl shadow-xl p-8">


          {/* BIKE + OWNER */}

          <div className="grid md:grid-cols-2 gap-8">

            {/* BIKE */}

            <div className="bg-gray-50 p-6 rounded-lg border">

              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: "#20B2AA" }}
              >
                Bike Details
              </h3>

              <p><b>Name:</b> {booking?.bike?.name}</p>
              <p><b>Model:</b> {booking?.bike?.model}</p>

              <div className="mt-3">

                <p className="font-semibold">Pickup Location</p>

                <p>{booking?.bike?.location?.addressLine}</p>
                <p>{booking?.bike?.location?.landmark}</p>
                <p>
                  {booking?.bike?.location?.city} - {booking?.bike?.location?.pincode}
                </p>

              </div>

            </div>


            {/* OWNER */}

            <div className="bg-gray-50 p-6 rounded-lg border">

              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: "#20B2AA" }}
              >
                Owner Details
              </h3>

              <p><b>Name:</b> {booking?.owner?.fullName}</p>
              <p><b>Email:</b> {booking?.owner?.email}</p>
              <p><b>Phone:</b> {booking?.owner?.phone}</p>

            </div>

          </div>


          {/* BOOKING */}

          <div className="mt-8 bg-gray-50 p-6 rounded-lg border">

            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "#20B2AA" }}
            >
              Booking Details
            </h3>

            <p>
              <b>Start Date:</b>{" "}
              {new Date(booking?.startDate).toDateString()}
            </p>

            <p>
              <b>End Date:</b>{" "}
              {new Date(booking?.endDate).toDateString()}
            </p>

          </div>


          {/* OTP */}

         {/* OTP */}

<div className="mt-8 text-center">

  <h3
    className="text-2xl font-semibold mb-4"
    style={{ color: "#20B2AA" }}
  >
    Pickup OTP
  </h3>

  {otp ? (

    <div
      className="p-8 rounded-xl text-center shadow-xl transform transition-all duration-500 scale-100 animate-bounce"
      style={{ backgroundColor: "#e6fffb" }}
    >

      <p className="mb-3 text-gray-600">
        Show this OTP to the bike owner
      </p>

      <h1
        className="text-6xl font-bold tracking-widest mb-6 animate-pulse"
        style={{ color: "#20B2AA" }}
      >
        {otp}
      </h1>

      <button
        onClick={copyOTP}
        className="px-6 py-2 text-white rounded-lg shadow hover:scale-105 transition"
        style={{ backgroundColor: "#20B2AA" }}
      >
        Copy OTP
      </button>

    </div>

  ) : (

    <button
      onClick={generateOTP}
      disabled={loading}
      className="px-8 py-3 text-white text-lg rounded-lg shadow-lg hover:scale-105 transition"
      style={{ backgroundColor: "#20B2AA" }}
    >
      {loading ? "Generating OTP..." : "Generate Pickup OTP"}
    </button>

  )}

</div>

        </div>

      </div>

    </div>
  );
};

export default PickupBike;