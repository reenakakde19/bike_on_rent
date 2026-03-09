import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [uploadedBikes, setUploadedBikes] = useState([]);
  const [bookedBikes, setBookedBikes] = useState([]);
  const [walletTxns, setWalletTxns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [addAmount, setAddAmount] = useState("");
  const [helpTopic, setHelpTopic] = useState("");
  const [helpMsg, setHelpMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const API = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  /* ---------------- PROFILE ---------------- */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/user/profile`, config);
      setUser(res.data.data);
    } catch (err) {
      console.error("Profile error:", err);
    }
  }, [config]);

  /* ---------------- USER BIKES ---------------- */
  const fetchUserBikes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/bikes/user/my`, config);
      setUploadedBikes(res.data.bikes || []);
    } catch (err) {
      console.error(err);
    }
  }, [config]);

  /* ---------------- BOOKINGS ---------------- */
  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/bookings/my`, config);
      setBookedBikes(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [config]);

  /* ---------------- WALLET ---------------- */
  const fetchWallet = useCallback(async () => {
    // TODO: Implement wallet API
    setWalletTxns([]);
  }, []);

  const addMoney = async () => {
    // TODO: Implement add money API
    alert("Wallet feature coming soon!");
  };

  /* ---------------- REVIEWS ---------------- */
  const fetchReviews = useCallback(async () => {
    if (!user || !user._id) return;
    try {
      const res = await axios.get(`${API}/reviews/${user._id}`, config);
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [config, user]);



  useEffect(() => {
    if (user) {
      fetchUserBikes();
      fetchBookings();
      fetchWallet();
      fetchReviews();
    }
  }, [user]);

  /* ---------------- HELP DESK ---------------- */
  const submitTicket = async () => {
    // TODO: Implement support API
    setSubmitted(true);
    setHelpTopic("");
    setHelpMsg("");
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const statusColor = (status) => {
    const map = {
      confirmed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">🏍️ BikeRental</h1>
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(user.fullName)}
            </div>
            <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── PROFILE ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-5">
            <h2 className="text-white text-lg font-semibold">Profile</h2>
          </div>
          {user ? (
            <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold shrink-0">
                {getInitials(user.fullName)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
                  <p className="text-gray-800 font-medium">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                  <p className="text-gray-800 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="text-gray-800 font-medium">{user.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-400">Loading profile…</div>
          )}
        </section>

        {/* ── UPLOADED BIKES ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-gray-800 font-semibold text-base">Your Uploaded Bikes</h2>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full">
              {uploadedBikes.length} bikes
            </span>
          </div>
          <div className="px-6 py-4">
            {uploadedBikes.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No bikes uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedBikes.map((bike) => (
                  <div key={bike._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50">
                    <p className="font-semibold text-gray-800">{bike.name}</p>
                    <p className="text-indigo-600 font-bold mt-1">₹{bike.pricePerDay}<span className="text-gray-400 font-normal text-xs">/day</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── BOOKINGS ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-gray-800 font-semibold text-base">Your Bookings</h2>
            <span className="text-xs bg-green-50 text-green-600 font-semibold px-2.5 py-1 rounded-full">
              {bookedBikes.length} bookings
            </span>
          </div>
          <div className="px-6 py-4">
            {bookedBikes.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookedBikes.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg">🏍️</div>
                      <p className="font-medium text-gray-800">{booking.bike?.name || "Unknown Bike"}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── WALLET ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-800 font-semibold text-base">Wallet</h2>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
              <button
                onClick={addMoney}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Add Money
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-semibold">Transaction History</p>
              {walletTxns.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-3">No transactions yet.</p>
              ) : (
                <div className="space-y-2">
                  {walletTxns.map((txn) => (
                    <div key={txn._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${txn.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                          {txn.type === "credit" ? "+" : "−"}
                        </span>
                        <span className="text-sm text-gray-700 capitalize">{txn.type}</span>
                      </div>
                      <span className={`font-semibold text-sm ${txn.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                        ₹{txn.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-800 font-semibold text-base">Your Reviews</h2>
          </div>
          <div className="px-6 py-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-base ${i < review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                      ))}
                      <span className="ml-2 text-xs text-gray-400">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── HELP DESK ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-800 font-semibold text-base">Help Desk</h2>
          </div>
          <div className="px-6 py-5">
            {submitted ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-4">
                <span className="text-green-500 text-xl">✅</span>
                <p className="text-green-700 font-medium text-sm">Ticket submitted successfully! We'll get back to you soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Billing issue, Bike damage…"
                    value={helpTopic}
                    onChange={(e) => setHelpTopic(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Message</label>
                  <textarea
                    placeholder="Describe your issue in detail…"
                    value={helpMsg}
                    onChange={(e) => setHelpMsg(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
                  />
                </div>
                <button
                  onClick={submitTicket}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default UserDashboard;