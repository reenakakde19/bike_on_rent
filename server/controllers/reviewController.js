import Review from "../models/review.js";
import Booking from "../models/booking.js";

/* CREATE REVIEW */
export const createReview = async (req, res) => {
  try {
    const { booking, reviewFor, rating, comment } = req.body;
    const reviewer = req.user.userId;

    // check booking exists
    const bookingData = await Booking.findById(booking);
    if (!bookingData) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // prevent duplicate review for same booking
    const existingReview = await Review.findOne({ booking, reviewer });
    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    const review = await Review.create({
      booking,
      reviewer,
      reviewFor,
      rating,
      comment
    });

    res.status(201).json({
      message: "Review created successfully",
      review
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* GET ALL REVIEWS */
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("reviewer", "fullName")
      .populate("booking");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* GET REVIEWS FOR BIKE OR USER */
export const getReviewsByTarget = async (req, res) => {
  try {
    const { reviewFor } = req.params;

    const reviews = await Review.find({ reviewFor })
      .populate("reviewer", "fullName")
      .populate("booking");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* UPDATE REVIEW */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewer = req.user.userId;

    const review = await Review.findOne({ _id: id, reviewer });
    if (!review) {
      return res.status(403).json({ message: "Not authorized to update" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    await review.save();

    res.json({
      message: "Review updated successfully",
      review
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* DELETE REVIEW */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.reviewer.toString() !== userId && role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
