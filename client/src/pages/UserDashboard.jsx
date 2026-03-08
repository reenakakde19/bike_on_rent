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
    headers: {
      Authorization: `Bearer ${token}`
    }
  }), [token]);

  /* ---------------- PROFILE ---------------- */

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/users/profile`, config);
      setUser(res.data.user);
    } catch (err) {
      console.error("Profile error:", err);
    }
  }, [config, API]);

  /* ---------------- USER BIKES ---------------- */

  const fetchUserBikes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/bikes/my-bikes`, config);
      setUploadedBikes(res.data.bikes || []);
    } catch (err) {
      console.error(err);
    }
  }, [config, API]);

  /* ---------------- BOOKINGS ---------------- */

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/bookings/my-bookings`, config);
      setBookedBikes(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  }, [config, API]);

  /* ---------------- WALLET ---------------- */

  const fetchWallet = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/wallet`, config);
      setWalletTxns(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  }, [config, API]);

  const addMoney = async () => {
    try {
      await axios.post(
        `${API}/wallet/add`,
        { amount: addAmount },
        config
      );

      setAddAmount("");
      fetchWallet();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- REVIEWS ---------------- */

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/reviews/user`, config);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  }, [config, API]);

  useEffect(() => {
    fetchProfile();
    fetchUserBikes();
    fetchBookings();
    fetchWallet();
    fetchReviews();
  }, [fetchProfile, fetchUserBikes, fetchBookings, fetchWallet, fetchReviews]);

  /* ---------------- HELP DESK ---------------- */

  const submitTicket = async () => {
    try {
      await axios.post(
        `${API}/support`,
        {
          topic: helpTopic,
          message: helpMsg
        },
        config
      );

      setSubmitted(true);
      setHelpTopic("");
      setHelpMsg("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Profile Dashboard</h1>

      {/* ---------------- USER PROFILE ---------------- */}

      <h2>User Info</h2>

      {user && (
        <div>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Phone:</b> {user.phone}</p>
        </div>
      )}

      {/* ---------------- UPLOADED BIKES ---------------- */}

      <h2>Your Uploaded Bikes</h2>

      {uploadedBikes.length === 0 ? (
        <p>No bikes uploaded</p>
      ) : (
        uploadedBikes.map((bike) => (
          <div key={bike._id}>
            <p>{bike.name}</p>
            <p>₹{bike.pricePerDay}/day</p>
          </div>
        ))
      )}

      {/* ---------------- BOOKINGS ---------------- */}

      <h2>Your Bookings</h2>

      {bookedBikes.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        bookedBikes.map((booking) => (
          <div key={booking._id}>
            <p>Bike: {booking.bike?.name}</p>
            <p>Status: {booking.status}</p>
          </div>
        ))
      )}

      {/* ---------------- WALLET ---------------- */}

      <h2>Wallet</h2>

      <input
        type="number"
        placeholder="Add amount"
        value={addAmount}
        onChange={(e) => setAddAmount(e.target.value)}
      />

      <button onClick={addMoney}>Add Money</button>

      <h3>Transactions</h3>

      {walletTxns.map((txn) => (
        <div key={txn._id}>
          <p>{txn.type} - ₹{txn.amount}</p>
        </div>
      ))}

      {/* ---------------- REVIEWS ---------------- */}

      <h2>Your Reviews</h2>

      {reviews.map((review) => (
        <div key={review._id}>
          <p>{review.comment}</p>
          <p>Rating: {review.rating}</p>
        </div>
      ))}

      {/* ---------------- HELP DESK ---------------- */}

      <h2>Help Desk</h2>

      {submitted ? (
        <p>Ticket submitted successfully</p>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Topic"
            value={helpTopic}
            onChange={(e) => setHelpTopic(e.target.value)}
          />

          <br />

          <textarea
            placeholder="Message"
            value={helpMsg}
            onChange={(e) => setHelpMsg(e.target.value)}
          />

          <br />

          <button onClick={submitTicket}>
            Submit Ticket
          </button>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;