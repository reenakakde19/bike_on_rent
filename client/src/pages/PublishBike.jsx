import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const PublishBike = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    bikeName: "",
    bikeNumber: "",
    bikeType: "",
    brand: "",
    model: "",
    year: "",
    fuelType: "",
    transmission: "",
    engineCapacity: "",
    description: "",
    perHour: "",
    perDay: "",
    securityDeposit: "",
    lateFeePerHour: "",
    minHours: 1,
    maxHours: 24,
    cancellationPolicy: "moderate",
    instantBooking: false,
    city: "",
    addressLine: "",
    landmark: "",
    pincode: "",
    latitude: "",
    longitude: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/bikes",
        {
          ...formData,
          pricing: {
            perHour: formData.perHour,
            perDay: formData.perDay
          },
          bookingRules: {
            minHours: formData.minHours,
            maxHours: formData.maxHours
          },
          location: {
            city: formData.city,
            addressLine: formData.addressLine,
            landmark: formData.landmark,
            pincode: formData.pincode,
            coordinates: {
              type: "Point",
              coordinates: [
                Number(formData.longitude),
                Number(formData.latitude)
              ]
            }
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Bike submitted for admin approval 🚀");

    } catch (error) {
      alert(error.response?.data?.message || "Error creating bike");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Publish Your Bike 🚲
        </h1>

        {/* PROGRESS BAR */}
        <div className="mb-10">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className={step >= 1 ? "text-teal-600" : "text-gray-400"}>
              Step 1
            </span>
            <span className={step >= 2 ? "text-teal-600" : "text-gray-400"}>
              Step 2
            </span>
            <span className={step >= 3 ? "text-teal-600" : "text-gray-400"}>
              Step 3
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">

            {/* STEP 1 */}
{step === 1 && (
  <motion.div
    key="step1"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.4 }}
    className="space-y-8"
  >
    <h2 className="text-xl font-semibold">Basic Details & Specifications</h2>

    {/* Basic Details */}
    <div className="grid md:grid-cols-2 gap-4">
      <input name="bikeName" placeholder="Bike Name" className="inputStyle" onChange={handleChange} required />
      <input name="bikeNumber" placeholder="Bike Number" className="inputStyle" onChange={handleChange} required />
      <input name="brand" placeholder="Brand" className="inputStyle" onChange={handleChange} />
      <input name="model" placeholder="Model" className="inputStyle" onChange={handleChange} />
      <input type="number" name="year" placeholder="Year" className="inputStyle" onChange={handleChange} />
    </div>

    {/* Bike Type */}
    <div>
      <p className="font-medium mb-3">Bike Type</p>
      <div className="flex gap-4">
        {["bike", "scooty", "electric"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, bikeType: type })}
            className={`px-6 py-2 rounded-full border transition ${
              formData.bikeType === type
                ? "bg-teal-500 text-white shadow-lg"
                : "bg-white"
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
    </div>

    {/* Specifications */}
    <div className="grid md:grid-cols-3 gap-4">
      <select name="fuelType" className="inputStyle" onChange={handleChange}>
        <option value="">Fuel Type</option>
        <option value="petrol">Petrol</option>
        <option value="electric">Electric</option>
        <option value="hybrid">Hybrid</option>
      </select>

      <select name="transmission" className="inputStyle" onChange={handleChange}>
        <option value="">Transmission</option>
        <option value="manual">Manual</option>
        <option value="automatic">Automatic</option>
      </select>

      <input
        type="number"
        name="engineCapacity"
        placeholder="Engine Capacity (cc)"
        className="inputStyle"
        onChange={handleChange}
      />
    </div>

    <button type="button" onClick={nextStep} className="nextBtn">
      Next →
    </button>
  </motion.div>
)}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Pricing & Rules</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <input type="number" name="perHour" placeholder="₹ Per Hour" className="inputStyle" onChange={handleChange} required />
                  <input type="number" name="perDay" placeholder="₹ Per Day" className="inputStyle" onChange={handleChange} required />
                  <input type="number" name="securityDeposit" placeholder="Security Deposit" className="inputStyle" onChange={handleChange} />
                  <input type="number" name="lateFeePerHour" placeholder="Late Fee Per Hour" className="inputStyle" onChange={handleChange} />
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="backBtn">
                    ← Back
                  </button>
                  <button type="button" onClick={nextStep} className="nextBtn">
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold">Location & Description</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <input name="city" placeholder="City" className="inputStyle" onChange={handleChange} required />
                  <input name="addressLine" placeholder="Address Line" className="inputStyle" onChange={handleChange} />
                  <input name="latitude" placeholder="Latitude" className="inputStyle" onChange={handleChange} required />
                  <input name="longitude" placeholder="Longitude" className="inputStyle" onChange={handleChange} required />
                </div>

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe your bike..."
                  className="inputStyle w-full"
                  onChange={handleChange}
                />

                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="backBtn">
                    ← Back
                  </button>
                  <button type="submit" className="submitBtn">
                    Submit for Approval 🚀
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default PublishBike;