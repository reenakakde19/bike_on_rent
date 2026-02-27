import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    // 🔗 Relationship
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    againstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🧾 Dispute Info
    disputeType: {
      type: String,
      enum: [
        "damage",
        "payment",
        "late_return",
        "cancellation",
        "misuse",
        "no_show",
        "other"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    evidence: [
      {
        type: String // image/video URLs
      }
    ],

    // 💰 Financial Impact
    amountInQuestion: {
      type: Number,
      default: 0
    },

    // 🚦 Status Flow
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "rejected", "escalated"],
      default: "open"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    disputeWindowClosed: {
      type: Boolean,
      default: false
    },

    // 🧑‍⚖️ Admin Resolution
    adminDecision: {
      action: {
        type: String,
        enum: ["refund", "partial_refund", "penalty", "no_action"]
      },
      refundAmount: Number,
      penaltyAmount: Number,
      note: String
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    resolvedAt: Date,

    // 🧠 System Intelligence
    isAutoResolved: {
      type: Boolean,
      default: false
    },

    escalationLevel: {
      type: Number,
      default: 0
    },

    // 📜 Audit Trail (LEGAL SAFETY)
    auditTrail: [
      {
        action: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        role: {
          type: String,
          enum: ["owner", "renter", "admin", "system"]
        },
        note: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// 🔍 Indexes
disputeSchema.index({ booking: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ priority: 1 });

export default mongoose.model("Dispute", disputeSchema);
