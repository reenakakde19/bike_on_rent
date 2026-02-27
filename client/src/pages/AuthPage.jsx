import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; //To send API requests to backend
import "./auth.css";

const AuthPage = () => {
  const navigate = useNavigate(); //To redirect user after login (React Router)

  const [isLogin, setIsLogin] = useState(true); //Show Login form
  const [isOTPStage, setIsOTPStage] = useState(false); //Show OTP verification form
  const [isForgotStage, setIsForgotStage] = useState(false); //Show Forgot password form

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  }); //This stores user input values.
  //formData.email
// formData.password

  const [otp, setOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  /* ================= LOGIN / REGISTER ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await axios.post(
          "http://localhost:5000/api/user/login",
          {
            email: formData.email,
            password: formData.password,
          }
        );

        localStorage.setItem("token", res.data.token);
        alert("Login Successful 🚴");
        navigate("/home");
//3A2DvtkstYI9bgbrpUQbvTPYGTg_7qLdT5s3YHs5NrboCkrGE
      } else {
        await axios.post(
          "http://localhost:5000/api/user/register",
          formData
        );

        alert("OTP sent to your email 📩");
        setIsOTPStage(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  /* ================= VERIFY OTP ================= */

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    //rzp_test_SJfRzhlyuwVV8C


// D3eZO6q7m608rPqK2JVXAWlc Test Key Secret
// rzp_test_SJfRzhlyuwVV8C Test Key ID

    try {
      await axios.post(
        "http://localhost:5000/api/user/verify-email",
        {
          email: formData.email,
          otp: otp,
        }
      );

      alert("Email Verified 🎉");
      setIsOTPStage(false);
      setIsLogin(true);

    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    }
  };

  /* ================= FORGOT PASSWORD ================= */

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/user/forgot-password",
        { email: formData.email }
      );

      alert("Reset link sent to your email 📩");
      setIsForgotStage(false);
      setIsLogin(true);

    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="logo">
          🚴 BIKE
          <span className="text-teal-400">ON</span>
          RENT
        </h1>

        {!isOTPStage && !isForgotStage && (
          <div className="toggle-buttons">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
        )}

        {/* ================= NORMAL FORM ================= */}

        {!isOTPStage && !isForgotStage && (
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-btn">
              {isLogin ? "Login Now" : "Create Account"}
            </button>

            {isLogin && (
              <p
                style={{ marginTop: "10px", cursor: "pointer", color: "#00bcd4" }}
                onClick={() => setIsForgotStage(true)}
              >
                Forgot Password?
              </p>
            )}
          </form>
        )}

        {/* ================= OTP FORM ================= */}

        {isOTPStage && (
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button type="submit" className="submit-btn">
              Verify OTP
            </button>
          </form>
        )}

        {/* ================= FORGOT PASSWORD FORM ================= */}

        {isForgotStage && (
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-btn">
              Send Reset Link
            </button>

            <p
              style={{ marginTop: "10px", cursor: "pointer", color: "#00bcd4" }}
              onClick={() => setIsForgotStage(false)}
            >
              Back to Login
            </p>
          </form>
        )}
      </div>

      {/* RIGHT SIDE (UNCHANGED) */}
      <div className="auth-right">
        <div className="bike-content">
          <h2>🚴 Find Your Perfect Ride</h2>
          <p>
            Rent bikes from real people near you. Affordable, flexible,
            and adventure ready.
          </p>

          <div className="bike-icons">
            🏍️ 🚴‍♀️ 🛵 🚵‍♂️
          </div>

          <p className="quote">
            “From city streets to mountain peaks — your next ride is just one click away.”
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
