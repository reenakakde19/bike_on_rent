import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema(
  {
    /* ===============================
       OWNER INFORMATION
    =============================== */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* ===============================
       BASIC BIKE DETAILS
    =============================== */
    bikeName: {
      type: String,
      trim: true,
      required: true
    },

    bikeNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    bikeType: {
      type: String,
      enum: ["bike", "scooty", "electric"],
      required: true
    },

    brand: {
      type: String,
      trim: true
    },

    model: {
      type: String,
      trim: true
    },

    year: {
      type: Number,
      min: 2000,
      max: new Date().getFullYear()
    },

    description: {
      type: String,
      maxlength: 1000
    },

    /* ===============================
       TECHNICAL SPECIFICATIONS
    =============================== */
    fuelType: {
      type: String,
      enum: ["petrol", "electric", "hybrid"]
    },

    transmission: {
      type: String,
      enum: ["manual", "automatic"]
    },

    engineCapacity: {
      type: Number // Example: 110, 150 (cc)
    },

    /* ===============================
       PRICING
    =============================== */
    pricing: {
      perHour: {
        type: Number,
        required: true,
        min: 0
      },
      perDay: {
        type: Number,
        required: true,
        min: 0
      }
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0
    },

    lateFeePerHour: {
      type: Number,
      default: 0
    },

    /* ===============================
       BOOKING RULES
    =============================== */
    bookingRules: {
      minHours: {
        type: Number,
        default: 1
      },
      maxHours: {
        type: Number,
        default: 72
      }
    },

    instantBooking: {
      type: Boolean,
      default: false
    },

    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict"],
      default: "moderate"
    },

    blockedDates: [
      {
        start: Date,
        end: Date
      }
    ],

    /* ===============================
       AVAILABILITY
    =============================== */
    isAvailable: {
      type: Boolean,
      default: true
    },

    availabilityWindow: {
      startTime: Date,
      endTime: Date
    },

    totalRides: {
      type: Number,
      default: 0
    },

    /* ===============================
       LOCATION (GEO SEARCH READY)
    =============================== */
    location: {
      city: {
        type: String,
        required: true,
        index: true
      },
      addressLine: String,
      landmark: String,
      pincode: String,
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      }
    },

    /* ===============================
       DOCUMENT VERIFICATION
    =============================== */
    documents: {
      rcBookVerified: {
        type: Boolean,
        default: false
      },
      insuranceValid: {
        type: Boolean,
        default: false
      }
    },

    /* ===============================
       MEDIA
    =============================== */
    images: [
      {
        type: String
      }
    ],

    /* ===============================
       RATING SYSTEM
    =============================== */
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0
      }
    },

    /* ===============================
       ADMIN CONTROL
    =============================== */
    adminStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },

    rejectionReason: String,

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

/* ===============================
   INDEXES (VERY IMPORTANT)
=============================== */

// Geospatial index
BikeSchema.index({ "location.coordinates": "2dsphere" });

// Search index
BikeSchema.index({ bikeName: "text", brand: "text", model: "text" });

export default mongoose.model("Bike", BikeSchema);