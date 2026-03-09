import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  CreditCard,
  CheckCircle,
  Upload,
  Shield,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const STEPS = ["Duration", "Documents", "Summary", "Payment"];

const BookingPage = () => {
  const { bikeId } = useParams();
  const [bike, setBike] = useState(null);
  const [step, setStep] = useState(0);

  const [durationType, setDurationType] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [aadhar, setAadhar] = useState(null);
  const [license, setLicense] = useState(null);
  const aadharRef = useRef();
  const licenseRef = useRef();

  const [amountBreakdown, setAmountBreakdown] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bikes/${bikeId}`);
        setBike(res.data.data);
      } catch (err) {
        console.error("Error fetching bike:", err);
      }
    })();
  }, [bikeId]);

  const calcAmount = () => {
    if (!startDate || !endDate || !bike) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    if (diffMs <= 0) return null;

    let units, rate, label;
    if (durationType === "hour") {
      units = Math.ceil(diffMs / (1000 * 60 * 60));
      rate = bike.pricing?.perHour ?? Math.round(bike.pricing?.perDay / 8);
      label = "hrs";
    } else {
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      rate = bike.pricing?.perDay;
      label = "days";
    }
    const base = units * rate;
    const platformFee = Math.round(base * 0.05);
    const vendorEarning = base - platformFee;
    const total = base + platformFee;
    return { units, rate, label, base, platformFee, vendorEarning, total };
  };

  const handleNext = () => {
    if (step === 0) {
      const amt = calcAmount();
      if (!amt) return alert("Please select valid dates.");
      setAmountBreakdown(amt);
    }
    if (step === 1 && (!aadhar || !license))
      return alert("Please upload both documents.");
    setStep((s) => s + 1);
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("aadharCard", aadhar);
      formData.append("drivingLicense", license);

      const docRes = await axios.post(
        "http://localhost:5000/api/bookings/upload-docs",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      const { aadharUrl, licenseUrl } = docRes.data;

      const bookingRes = await axios.post(
        "http://localhost:5000/api/bookings",
        {
          bikeId: bikeId,
          startDate: startDate,
          endDate: endDate,
          durationType,
          documents: { aadharCard: aadharUrl, drivingLicense: licenseUrl },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bookingId = bookingRes.data.booking._id;

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
    await axios.post(
      "http://localhost:5000/api/payment/verify",
      { ...response, bookingId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStep(4);
  },

  modal: {
    ondismiss: function () {
      alert("Payment cancelled");
    }
  },

  theme: { color: "#20B2AA" }
};
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      // display server error message if available
      console.error("Booking creation error:", err.response?.data || err);
      const msg = err.response?.data?.message || "Payment Failed";
      alert(msg);
    }
  };

  if (!bike)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-white to-[#E6FFFA] flex items-center justify-center">
        <div className="text-[#20B2AA] text-lg font-medium">Loading...</div>
      </div>
    );

  const renderStep = () => {
    if (step === 4)
      return (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-5 py-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, delay: 0.15 }}
          >
            <CheckCircle size={72} className="text-[#20B2AA]" strokeWidth={1.5} />
          </motion.div>
          <h3 className="text-2xl font-bold text-[#0F172A]">
            🎉 Booking Confirmed!
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Your booking is awaiting vendor approval. You'll receive an OTP for
            bike handover once confirmed.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-700 font-medium w-full">
            Status: PENDING VENDOR APPROVAL
          </div>
        </motion.div>
      );

    if (step === 0)
      return (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Booking Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["hour", "day"].map((t) => (
                <button
                  key={t}
                  onClick={() => setDurationType(t)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    durationType === t
                      ? "bg-[#20B2AA] border-[#20B2AA] text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#20B2AA]"
                  }`}
                >
                  {t === "hour" ? <Clock size={15} /> : <Calendar size={15} />}
                  Per {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Start {durationType === "hour" ? "Date & Time" : "Date"}
            </label>
            <input
              type={durationType === "hour" ? "datetime-local" : "date"}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#20B2AA] transition mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <Calendar size={14} className="inline mr-1" />
              End {durationType === "hour" ? "Date & Time" : "Date"}
            </label>
            <input
              type={durationType === "hour" ? "datetime-local" : "date"}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#20B2AA] transition mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(() => {
            const p = calcAmount();
            return p ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#F0FDFA] border border-[#99f6e4] rounded-xl px-4 py-3 flex justify-between text-sm"
              >
                <span className="text-gray-500">
                  {p.units} {p.label} × ₹{p.rate}
                </span>
                <span className="text-[#20B2AA] font-bold">₹{p.base}</span>
              </motion.div>
            ) : null;
          })()}
        </div>
      );

    if (step === 1)
      return (
        <div className="space-y-5">
          <p className="text-gray-500 text-sm leading-relaxed">
            Upload clear photos or PDFs of your documents. Required for bike
            handover verification.
          </p>

          {[
            { label: "Aadhaar Card", ref: aadharRef, file: aadhar, set: setAadhar, Icon: Shield },
            { label: "Driving License", ref: licenseRef, file: license, set: setLicense, Icon: FileText },
          ].map(({ label, ref, file, set, Icon }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Icon size={14} className="inline mr-1" />
                {label}
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                ref={ref}
                className="hidden"
                onChange={(e) => set(e.target.files[0])}
              />
              <button
                onClick={() => ref.current.click()}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all mt-1 ${
                  file
                    ? "bg-[#F0FDFA] border-[#20B2AA] text-[#20B2AA]"
                    : "bg-white border-gray-200 text-gray-400 hover:border-[#20B2AA] hover:text-[#20B2AA]"
                }`}
              >
                <span className="truncate max-w-[80%]">
                  {file ? file.name : `Click to upload ${label}`}
                </span>
                {file ? <CheckCircle size={16} /> : <Upload size={16} />}
              </button>
            </div>
          ))}
        </div>
      );

    if (step === 2 && amountBreakdown)
      return (
        <div className="space-y-4">
          <div className="bg-[#F0FDFA] rounded-2xl px-4 py-3 text-center">
            <p className="font-bold text-[#0F172A]">{bike.bikeName}</p>
            <p className="text-gray-500 text-sm">
              {durationType === "hour" ? "Hourly" : "Daily"} rental
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Start", val: startDate },
              { label: "End", val: endDate },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                <p className="text-[#0F172A] font-semibold text-xs">{val}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#F0FDFA] rounded-2xl overflow-hidden border border-[#99f6e4]">
            {[
              { label: `${amountBreakdown.units} ${amountBreakdown.label} × ₹${amountBreakdown.rate}`, val: `₹${amountBreakdown.base}` },
              { label: "Platform Fee (5%)", val: `₹${amountBreakdown.platformFee}` },
              { label: "Vendor Earning", val: `₹${amountBreakdown.vendorEarning}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between px-4 py-3 border-b border-teal-100 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-700 font-medium">{val}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-4">
              <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                <IndianRupee size={15} /> Total Amount
              </span>
              <span className="text-xl font-bold text-[#20B2AA]">
                ₹{amountBreakdown.total}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#20B2AA] bg-[#F0FDFA] border border-[#99f6e4] rounded-xl px-4 py-2.5">
            <CheckCircle size={13} />
            Documents uploaded · pending vendor verification
          </div>

          <p className="text-xs text-gray-400 text-center">
            After payment, status will be{" "}
            <span className="text-amber-500 font-semibold">PENDING_VENDOR_APPROVAL</span>
          </p>
        </div>
      );
  };

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

        <div className="text-center text-gray-500 text-sm">
          {bike.bikeName} — ₹{bike.pricing.perDay}/day
          {bike.pricing?.perHour ? ` · ₹${bike.pricing.perHour}/hr` : ""}
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between px-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      i < step
                        ? "bg-[#20B2AA] text-white"
                        : i === step
                        ? "bg-[#20B2AA] text-white shadow-lg"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      i === step ? "text-[#20B2AA]" : "text-gray-400"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 transition-all duration-300 ${
                      i < step ? "bg-[#20B2AA]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-[#20B2AA] text-white py-3 rounded-xl font-semibold hover:bg-[#178f89] transition flex items-center justify-center gap-2 text-sm"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-[#20B2AA] to-[#178f89] text-white py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition shadow-xl flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> Proceed to Pay 💳
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookingPage;