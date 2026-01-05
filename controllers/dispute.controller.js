import Dispute from "../models/disputeDamge.js";
import Booking from "../models/booking.js";

/**
 * CREATE DISPUTE
 * User raises dispute for a booking
 */
export const createDispute = async (req, res) => {
  try {
    const { booking, description, images } = req.body;

    // optional: check booking exists
    const bookingExists = await Booking.findById(booking);
    if (!bookingExists) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const dispute = await Dispute.create({
      booking,
      raisedBy: req.user.id,
      description,
      images,
      status: "open"
    });

    res.status(201).json({
      success: true,
      message: "Dispute raised successfully",
      data: dispute
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET ALL DISPUTES (Admin / Support)
 */
export const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("booking")
      .populate("raisedBy", "name email");

    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user.id })
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET SINGLE DISPUTE BY ID
 */
export const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate("booking")
      .populate("raisedBy", "name email");

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found"
      });
    }

    res.status(200).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * UPDATE DISPUTE STATUS / RESOLUTION (Admin)
 */
export const updateDispute = async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found"
      });
    }

    // ✅ Status flow validation
    const validTransitions = {
      open: ["under_review"],
      under_review: ["resolved"],
      resolved: []
    };

    if (status) {
      const allowedNextStatus = validTransitions[dispute.status];

      if (!allowedNextStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${dispute.status} to ${status}`
        });
      }

      dispute.status = status;
    }

    if (resolution) {
      dispute.resolution = resolution;
    }

    await dispute.save();

    res.status(200).json({
      success: true,
      message: "Dispute updated successfully",
      data: dispute
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * DELETE DISPUTE (Admin only)
 */
export const deleteDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found"
      });
    }

    await dispute.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dispute deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
