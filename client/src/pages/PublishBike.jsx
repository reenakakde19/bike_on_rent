import React, { useState } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

const TOTAL_STEPS = 5;

const PublishBike = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Basic
    bikeName: "",
    bikeNumber: "",
    bikeType: "",
    brand: "",
    model: "",
    year: "",
    description: "",
    // Tech
    fuelType: "",
    transmission: "",
    engineCapacity: "",
    mileage: "",
    // Pricing
    perHour: "",
    perDay: "",
    securityDeposit: "",
    lateFeePerHour: "",
    // Booking rules
    minHours: 1,
    maxHours: 72,
    cancellationPolicy: "moderate",
    instantBooking: false,
    // Location
    city: "",
    addressLine: "",
    landmark: "",
    pincode: "",
    latitude: "",
    longitude: "",
    // Availability
    availabilityType: "always",
    alwaysAvailable: true,
    weekly: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
  });

  // Document files
  const [documents, setDocuments] = useState({
    rcBook: null,
    insurance: null,
    insuranceValidTill: "",
    pollution: null,
    pollutionValidTill: "",
  });

  // Image files
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWeeklyToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      weekly: { ...prev.weekly, [day]: !prev.weekly[day] },
    }));
  };

  const handleDocChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setDocuments((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setDocuments((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      // Append all basic fields
      Object.entries(formData).forEach(([key, val]) => {
        if (key === "weekly") {
          data.append("weekly", JSON.stringify(val));
        } else {
          data.append(key, val);
        }
      });

      // Documents
      if (documents.rcBook) data.append("rcBook", documents.rcBook);
      if (documents.insurance) data.append("insurance", documents.insurance);
      data.append("insuranceValidTill", documents.insuranceValidTill);
      if (documents.pollution) data.append("pollution", documents.pollution);
      data.append("pollutionValidTill", documents.pollutionValidTill);

      // Images
      images.forEach((img) => data.append("images", img));

      // Structured fields
      data.append("pricing", JSON.stringify({ perHour: formData.perHour, perDay: formData.perDay }));
      data.append("bookingRules", JSON.stringify({ minHours: formData.minHours, maxHours: formData.maxHours }));
      data.append(
        "location",
        JSON.stringify({
          city: formData.city,
          addressLine: formData.addressLine,
          landmark: formData.landmark,
          pincode: formData.pincode,
          coordinates: {
            type: "Point",
            coordinates: [Number(formData.longitude), Number(formData.latitude)],
          },
        })
      );
      data.append(
        "availability",
        JSON.stringify({
          type: formData.availabilityType,
          alwaysAvailable: formData.alwaysAvailable,
          weekly: formData.weekly,
        })
      );

      await axios.post("http://localhost:5000/api/bikes", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Bike submitted for admin approval 🚀");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating bike");
    }
  };

  const stepLabels = ["Details", "Specs & Pricing", "Availability", "Location", "Documents & Media"];

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-gray-50 placeholder-gray-400";

  const selectCls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-gray-50 text-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Publish Your Bike 🚲</h1>
        <p className="text-gray-400 text-sm mb-8">Complete all steps to list your bike for rent</p>

        {/* PROGRESS */}
        <div className="mb-10">
          <div className="flex justify-between text-xs font-semibold mb-2">
            {stepLabels.map((label, i) => (
              <span key={i} className={step >= i + 1 ? "text-teal-600" : "text-gray-300"}>
                {label}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">

            {/* ─── STEP 1: Basic Details ─── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-700">Basic Details</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Bike Name *</label>
                    <input name="bikeName" value={formData.bikeName} placeholder="e.g. Royal Enfield Classic 350" className={inputCls} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Bike Number * (e.g. MH12AB1234)</label>
                    <input name="bikeNumber" value={formData.bikeNumber} placeholder="MH12AB1234" className={inputCls} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Brand *</label>
                    <input name="brand" value={formData.brand} placeholder="e.g. Royal Enfield" className={inputCls} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Model *</label>
                    <input name="model" value={formData.model} placeholder="e.g. Classic 350" className={inputCls} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Year * (2000–{new Date().getFullYear()})</label>
                    <input type="number" name="year" value={formData.year} placeholder="2022" min="2000" max={new Date().getFullYear()} className={inputCls} onChange={handleChange} required />
                  </div>
                </div>

                {/* Bike Type */}
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-3">Bike Type *</p>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { value: "bike", emoji: "🏍️", label: "Bike" },
                      { value: "scooty", emoji: "🛵", label: "Scooty" },
                      { value: "electric", emoji: "⚡", label: "Electric" },
                    ].map(({ value, emoji, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, bikeType: value })}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full border-2 text-sm font-medium transition ${
                          formData.bikeType === value
                            ? "bg-teal-500 text-white border-teal-500 shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                        }`}
                      >
                        <span>{emoji}</span> {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    rows="3"
                    maxLength={1000}
                    placeholder="Describe your bike condition, features, etc."
                    className={`${inputCls} resize-none`}
                    onChange={handleChange}
                  />
                  <p className="text-right text-xs text-gray-300 mt-1">{formData.description.length}/1000</p>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={nextStep} disabled={!formData.bikeName || !formData.bikeNumber || !formData.brand || !formData.model || !formData.year || !formData.bikeType}
                    className="bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition shadow">
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: Specs & Pricing ─── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-700">Specifications & Pricing</h2>

                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">Technical Specs</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Fuel Type *</label>
                      <select name="fuelType" value={formData.fuelType} className={selectCls} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="petrol">Petrol</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Transmission *</label>
                      <select name="transmission" value={formData.transmission} className={selectCls} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="manual">Manual</option>
                        <option value="automatic">Automatic</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Engine (cc)</label>
                      <input type="number" name="engineCapacity" value={formData.engineCapacity} placeholder="350" className={inputCls} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Mileage (km/l)</label>
                      <input type="number" name="mileage" value={formData.mileage} placeholder="40" className={inputCls} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">Pricing (₹)</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Per Hour *</label>
                      <input type="number" name="perHour" value={formData.perHour} placeholder="50" min="0" className={inputCls} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Per Day *</label>
                      <input type="number" name="perDay" value={formData.perDay} placeholder="500" min="0" className={inputCls} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Security Deposit *</label>
                      <input type="number" name="securityDeposit" value={formData.securityDeposit} placeholder="2000" min="0" className={inputCls} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Late Fee / Hour</label>
                      <input type="number" name="lateFeePerHour" value={formData.lateFeePerHour} placeholder="20" min="0" className={inputCls} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">Booking Rules</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Min Hours</label>
                      <input type="number" name="minHours" value={formData.minHours} min="1" className={inputCls} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Max Hours</label>
                      <input type="number" name="maxHours" value={formData.maxHours} min="1" max="72" className={inputCls} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Cancellation Policy</label>
                      <select name="cancellationPolicy" value={formData.cancellationPolicy} className={selectCls} onChange={handleChange}>
                        <option value="flexible">Flexible</option>
                        <option value="moderate">Moderate</option>
                        <option value="strict">Strict</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <input type="checkbox" name="instantBooking" id="instantBooking" checked={formData.instantBooking} onChange={handleChange} className="w-4 h-4 accent-teal-500" />
                      <label htmlFor="instantBooking" className="text-sm text-gray-600 font-medium">Enable Instant Booking ⚡</label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition">← Back</button>
                  <button type="button" onClick={nextStep} disabled={!formData.fuelType || !formData.transmission || !formData.perHour || !formData.perDay || !formData.securityDeposit}
                    className="bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition shadow">
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: Availability ─── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-700">Availability</h2>

                {/* Availability Type */}
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-3">Availability Type</p>
                  <div className="flex gap-3">
                    {[
                      { value: "always", label: "Always Available", emoji: "🟢" },
                      { value: "calendar", label: "Custom Schedule", emoji: "📅" },
                    ].map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, availabilityType: value, alwaysAvailable: value === "always" })}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full border-2 text-sm font-medium transition ${
                          formData.availabilityType === value
                            ? "bg-teal-500 text-white border-teal-500 shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                        }`}
                      >
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weekly schedule */}
                {formData.availabilityType === "calendar" && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-3">Available Days</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(formData.weekly).map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleWeeklyToggle(day)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition capitalize ${
                            formData.weekly[day]
                              ? "bg-teal-500 text-white border-teal-500"
                              : "bg-white text-gray-400 border-gray-200"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition">← Back</button>
                  <button type="button" onClick={nextStep} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold transition shadow">Next →</button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 4: Location ─── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-700">Location</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">City *</label>
                    <input name="city" value={formData.city} placeholder="e.g. Pune" className={inputCls} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Pincode</label>
                    <input name="pincode" value={formData.pincode} placeholder="411001" className={inputCls} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Address Line</label>
                    <input name="addressLine" value={formData.addressLine} placeholder="Street, Area" className={inputCls} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Landmark</label>
                    <input name="landmark" value={formData.landmark} placeholder="Near Shivaji Nagar metro" className={inputCls} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Latitude *</label>
                    <input name="latitude" value={formData.latitude} placeholder="18.5204" className={inputCls} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Longitude *</label>
                    <input name="longitude" value={formData.longitude} placeholder="73.8567" className={inputCls} onChange={handleChange} required />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition">← Back</button>
                  <button type="button" onClick={nextStep} disabled={!formData.city || !formData.latitude || !formData.longitude}
                    className="bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition shadow">
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 5: Documents & Media ─── */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-semibold text-gray-700">Documents & Photos</h2>

                {/* Documents */}
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Required Documents</p>

                  {/* RC Book */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📋</span>
                      <p className="font-medium text-gray-700 text-sm">RC Book *</p>
                    </div>
                    <input type="file" name="rcBook" accept="image/*,.pdf" onChange={handleDocChange} required
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 transition" />
                  </div>

                  {/* Insurance */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🛡️</span>
                      <p className="font-medium text-gray-700 text-sm">Insurance *</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input type="file" name="insurance" accept="image/*,.pdf" onChange={handleDocChange} required
                        className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 transition" />
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Valid Till *</label>
                        <input type="date" name="insuranceValidTill" value={documents.insuranceValidTill} onChange={handleDocChange} required className={inputCls} />
                      </div>
                    </div>
                  </div>

                  {/* Pollution */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🌿</span>
                      <p className="font-medium text-gray-700 text-sm">Pollution Certificate (PUC) *</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input type="file" name="pollution" accept="image/*,.pdf" onChange={handleDocChange} required
                        className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 transition" />
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Valid Till *</label>
                        <input type="date" name="pollutionValidTill" value={documents.pollutionValidTill} onChange={handleDocChange} required className={inputCls} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bike Photos */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Bike Photos * (minimum 2)</p>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-teal-300 transition">
                    <span className="text-3xl block mb-2">📸</span>
                    <p className="text-sm text-gray-500 mb-3">Upload clear photos of your bike (front, back, side)</p>
                    <input type="file" multiple accept="image/*" onChange={handleImages}
                      className="block mx-auto text-sm text-gray-500 file:mr-3 file:py-2 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 transition" />
                    {images.length > 0 && (
                      <p className="text-xs text-teal-600 mt-2 font-medium">✅ {images.length} photo{images.length > 1 ? "s" : ""} selected</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition">← Back</button>
                  <button
                    type="submit"
                    disabled={!documents.rcBook || !documents.insurance || !documents.insuranceValidTill || !documents.pollution || !documents.pollutionValidTill || images.length < 2}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-10 py-3 rounded-xl font-bold transition shadow-lg text-sm"
                  >
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