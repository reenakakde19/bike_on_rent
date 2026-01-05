import Dispute from "../models/Dispute.js";
import DisputeComment from "../models/DisputeComment.js";

/**
 * ADD COMMENT TO DISPUTE
 */
export const addComment = async (req, res) => {
  try {
    const { message, images } = req.body;

    const dispute = await Dispute.findById(req.params.disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found"
      });
    }

    const comment = await DisputeComment.create({
      dispute: dispute._id,
      sender: req.user.id,
      message,
      images
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET ALL COMMENTS FOR A DISPUTE
 */
export const getCommentsByDispute = async (req, res) => {
  try {
    const comments = await DisputeComment.find({
      dispute: req.params.disputeId
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
