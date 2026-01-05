const BikeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bikeName: String,

  bikeNumber: {
    type: String,
    required: true,
    unique: true
  },

  bikeType: {
    type: String,
    enum: ["bike", "scooty", "electric"],
    required: true
  },

  brand: String,
  model: String,
  year: Number,

  pricing: {
    perHour: Number,
    perDay: Number
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  availabilityWindow: {
    startTime: Date,
    endTime: Date
  },

  location: {
    city: String,
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: "2dsphere"
      }
    }
  },

  documents: {
    rcBookVerified: { type: Boolean, default: false },
    insuranceValid: { type: Boolean, default: false }
  },

  images: [String],

  rating: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Bike", BikeSchema);
