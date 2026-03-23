import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

/* -------------------- HELPERS -------------------- */
const normalizeEmail = (email) => email?.trim().toLowerCase();



/* -------------------- REGISTER -------------------- */
export const registerUser = async (req, res) => {
  try {
    let { fullName, phone, email, password } = req.body;

    // Validation
    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide fullName, phone, email, and password"
      });
    }

    if (phone.length < 10) {
      return res.status(400).json({
        status: "fail",
        message: "Phone number must be at least 10 digits"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters"
      });
    }

    email = normalizeEmail(email);

    const existingUser = await User.findOne({
      $or: [{ phone }, { email }]
    });

    if (existingUser) {

      // If user exists but not verified → resend OTP
      if (!existingUser.isEmailVerified) {

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        existingUser.emailOTP = crypto
          .createHash("sha256")
          .update(otp)
          .digest("hex");

        existingUser.emailOTPExpiry = Date.now() + 10 * 60 * 1000;

        await existingUser.save();

        // 🔥 FIXED (non-blocking)
        sendEmail(
          email,
          "BIKEONRENT Email Verification OTP",
          `Your OTP is: ${otp}`
        ).catch(err => console.error("Email failed:", err));

        return res.status(200).json({
          status: "success",
          message: "User exists but not verified. OTP resent."
        });
      }

      return res.status(409).json({
        status: "fail",
        message: "User already exists and verified"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    await User.create({
      fullName,
      phone,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      location: {
        type: "Point",
        coordinates: [0, 0]
      },
      emailOTP: hashedOTP,
      emailOTPExpiry: Date.now() + 10 * 60 * 1000
    });

    // 🔥 FIXED (non-blocking)
    sendEmail(
      email,
      "BIKEONRENT Email Verification OTP",
      `Your OTP for email verification is: ${otp}`
    ).catch(err => console.error("Email failed:", err));

    res.status(201).json({
      status: "success",
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error); // 👈 add this also
    res.status(500).json({ status: "error", message: error.message });
  }
};


/* -------------------- VERIFY EMAIL -------------------- */
/* -------------------- VERIFY EMAIL OTP -------------------- */
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and OTP"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (
      user.emailOTP !== hashedOTP ||
      user.emailOTPExpiry < Date.now()
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired OTP"
      });
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Email verified successfully"
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------- RESEND OTP -------------------- */
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: "fail",
        message: "Email already verified"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.emailOTPExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      normalizedEmail,
      "BIKEONRENT Resend OTP",
      `Your new OTP is: ${otp}`
    );

    res.status(200).json({
      status: "success",
      message: "OTP resent successfully"
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


/* -------------------- LOGIN -------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        status: "fail",
        message: "Account is blocked"
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: "fail",
        message: "Email not verified"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      token
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------- GET PROFILE -------------------- */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: user
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------- UPDATE PROFILE -------------------- */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      status: "success",
      message: "Profile updated",
      data: user
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------- UPDATE PASSWORD -------------------- */
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select("+password");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Old password incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------- FORGOT PASSWORD -------------------- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found"
      });
    }

    // 🔥 Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 🔐 Store Hashed Token in DB
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // ✅ SEND EMAIL HERE (AFTER SAVE)
    await sendEmail(
      normalizedEmail,
      "Reset Your BIKEONRENT Password",
      `Click this link to reset your password:

http://localhost:3000/reset-password/${resetToken}

This link will expire in 15 minutes.`
    );

    res.status(200).json({
      status: "success",
      message: "Password reset link sent"
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


/* -------------------- RESET PASSWORD -------------------- */
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide new password"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired token"
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successful"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------- DEACTIVATE ACCOUNT -------------------- */
export const deactivateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      isBlocked: true
    });

    res.status(200).json({
      status: "success",
      message: "Account deactivated"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

