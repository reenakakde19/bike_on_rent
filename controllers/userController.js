import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
   REGISTER
========================= */
export const registerUser = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phone,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone }).select("+password"); //findone finds the phone==phone from database
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   READ (GET PROFILE)
========================= */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   UPDATE PASSWORD
========================= */
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select("+password");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DELETE (SOFT DELETE)
========================= */
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      isBlocked: true
    });

    res.json({ message: "User account deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
