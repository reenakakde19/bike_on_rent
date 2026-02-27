import Bike from "../models/bike.js";
import mongoose from "mongoose";

/* =====================================================
   CREATE BIKE
===================================================== */
export const createBike = async (req, res) => {
  try {
    const {
      location,
      pricing,
      securityDeposit
    } = req.body;

    if (!location?.coordinates?.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required"
      });
    }

    if (!pricing?.perHour || !pricing?.perDay) {
      return res.status(400).json({
        success: false,
        message: "Pricing perHour and perDay are required"
      });
    }

    if (securityDeposit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Security deposit is required"
      });
    }

  const bike = await Bike.create({
  ...req.body,
  owner: req.user.userId,   // ✅ FIXED
  adminStatus: "approved",
  isAvailable: true
});

    res.status(201).json({
      success: true,
      message: "Bike submitted for admin approval",
      data: bike
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   GET ALL BIKES (Public Search)
===================================================== */
export const getAllBikes = async (req, res) => {
  try {
    const {
      city,
      bikeType,
      minPrice,
      maxPrice,
      search,
      lat,
      lng,
      radius = 5000,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {
      isDeleted: false,
      adminStatus: "approved",
      isAvailable: true
    };

    /* ---------- City Filter ---------- */
    if (city) {
      filter["location.city"] = {
        $regex: city,
        $options: "i"
      };
    }

    /* ---------- Bike Type ---------- */
    if (bikeType) {
      filter.bikeType = bikeType;
    }

    /* ---------- Price Filter ---------- */
    if (minPrice || maxPrice) {
      filter["pricing.perDay"] = {};
      if (minPrice) filter["pricing.perDay"].$gte = Number(minPrice);
      if (maxPrice) filter["pricing.perDay"].$lte = Number(maxPrice);
    }

    /* ---------- Text Search ---------- */
    if (search) {
      filter.$text = { $search: search };
    }

    /* ---------- Geo Search ---------- */
    if (lat && lng) {
      filter["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Number(radius)
        }
      };
    }

    const bikes = await Bike.find(filter)
      .populate("owner", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Bike.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: bikes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   GET SINGLE BIKE
===================================================== */
export const getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate("owner", "name email");

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: "Bike not found"
      });
    }

    res.status(200).json({
      success: true,
      data: bike
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   UPDATE BIKE
===================================================== */
export const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike || bike.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Bike not found"
      });
    }

    if (bike.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // Reset admin approval if major update
    req.body.adminStatus = "pending";

    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Bike updated & sent for re-approval",
      data: updatedBike
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   DELETE BIKE (Soft Delete)
===================================================== */
export const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike || bike.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Bike not found"
      });
    }

    if (bike.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    bike.isDeleted = true;
    await bike.save();

    res.status(200).json({
      success: true,
      message: "Bike deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   ADMIN: APPROVE / REJECT BIKE
===================================================== */
export const updateAdminStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: "Bike not found"
      });
    }

    bike.adminStatus = status;
    if (status === "rejected") {
      bike.rejectionReason = rejectionReason || "Not specified";
    }

    await bike.save();

    res.status(200).json({
      success: true,
      message: `Bike ${status} successfully`,
      data: bike
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};