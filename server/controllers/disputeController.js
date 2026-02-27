import mongoose from "mongoose";
import Dispute from "../models/Dispute.js";
import Booking from "../models/Booking.js";
import {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
  UNAUTHORIZED
} from "../utils/statusCode.js";

export const createDispute = async (req, res) => {
  try {
    const {
      booking,
      disputeType,
      title,
      description,
      evidence,
      amountInQuestion
    } = req.body;

    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(booking)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const bookingData = await Booking.findById(booking);
    if (!bookingData) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (
      bookingData.owner.toString() !== userId &&
      bookingData.renter.toString() !== userId
    ) {
      return res.status(FORBIDDEN).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    if (bookingData.status !== "completed") {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Dispute allowed only after booking completion"
      });
    }

    const existingDispute = await Dispute.findOne({
      booking,
      status: { $in: ["open", "under_review"] }
    });

    if (existingDispute) {
      return res.status(CONFLICT).json({
        success: false,
        message: "Active dispute already exists for this booking"
      });
    }

    const againstUser =
      bookingData.owner.toString() === userId
        ? bookingData.renter
        : bookingData.owner;

    const dispute = await Dispute.create({
      booking,
      raisedBy: userId,
      againstUser,
      disputeType,
      title,
      description,
      evidence,
      amountInQuestion,
      auditTrail: [
        {
          action: "DISPUTE_CREATED",
          performedBy: userId,
          role: "user",
          note: "Dispute raised"
        }
      ]
    });

    return res.status(CREATED).json({
      success: true,
      message: "Dispute created successfully",
      data: dispute
    });

  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};


export const getMyDisputes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const disputes = await Dispute.find({
      $or: [{ raisedBy: userId }, { againstUser: userId }]
    })
      .populate("booking")
      .sort({ createdAt: -1 });

    return res.status(OK).json({
      success: true,
      count: disputes.length,
      data: disputes
    });

  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};


export const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate("booking")
      .populate("raisedBy", "fullName")
      .populate("againstUser", "fullName");

    if (!dispute) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Dispute not found"
      });
    }

    const user = req.user;

    if (
      user.role !== "admin" &&
      dispute.raisedBy._id.toString() !== user.userId &&
      dispute.againstUser._id.toString() !== user.userId
    ) {
      return res.status(FORBIDDEN).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.status(OK).json({
      success: true,
      data: dispute
    });

  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/* =======================
   ADD EVIDENCE (USER)
======================= */
export const addDisputeEvidence = async (req, res) => {
  try {
    const { evidence } = req.body;
    const userId = req.user.userId;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Dispute not found"
      });
    }

    if (dispute.disputeWindowClosed) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Dispute window closed"
      });
    }

    if (
      dispute.raisedBy.toString() !== userId &&
      dispute.againstUser.toString() !== userId
    ) {
      return res.status(FORBIDDEN).json({
        success: false,
        message: "Unauthorized"
      });
    }

    dispute.evidence.push(...evidence);

    dispute.auditTrail.push({
      action: "EVIDENCE_ADDED",
      performedBy: userId,
      role: "user",
      note: "Additional evidence added"
    });

    await dispute.save();

    return res.status(OK).json({
      success: true,
      message: "Evidence added successfully"
    });

  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/* =======================
   ADMIN: RESOLVE DISPUTE
======================= */
export const resolveDispute = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(FORBIDDEN).json({
        success: false,
        message: "Admin access required"
      });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Dispute not found"
      });
    }

    const { status, priority, adminDecision } = req.body;

    dispute.status = status;
    dispute.priority = priority || dispute.priority;
    dispute.adminDecision = adminDecision;
    dispute.resolvedBy = req.user.userId;
    dispute.resolvedAt = new Date();
    dispute.disputeWindowClosed = true;

    dispute.auditTrail.push({
      action: "DISPUTE_RESOLVED",
      performedBy: req.user.userId,
      role: "admin",
      note: adminDecision?.note || "Admin resolved dispute"
    });

    await dispute.save();

    return res.status(OK).json({
      success: true,
      message: "Dispute resolved successfully",
      data: dispute
    });

  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/* =======================
   ADMIN: GET ALL DISPUTES
======================= */
export const getAllDisputes = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(FORBIDDEN).json({
        success: false,
        message: "Admin access only"
      });
    }

    const disputes = await Dispute.find()
      .populate("booking")
      .populate("raisedBy", "fullName")
      .populate("againstUser", "fullName")
      .sort({ createdAt: -1 });

    return res.status(OK).json({
      success: true,
      count: disputes.length,
      data: disputes
    });

  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};