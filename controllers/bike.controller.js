import Bike from "../models/bike.js";

/**
 * CREATE BIKE
 */
export const createBike = async (req, res) => {
  try {
    const bike = await bike.create({ //whatever the data is in bike model file .create me vo bike models ka data insert hota jayega 
      ...req.body, 
      
      //...req.body, Meaning Spread operator Takes all fields sent from frontend Example frontend sends:
    // {    
    //     "bikeName": "Activa",
    //     "bikeNumber": "MH12AB1234",
    //     "bikeType": "scooty"
    //   }
     
      owner: req.user.id   // Adds owner field manually req.user comes from auth middleware .id is the logged-in user’s ID
    });

    res.status(201).json({
      success: true,
      message: "Bike created successfully",
      data: bike
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET ALL BIKES
 */
export const getAllBikes = async (req, res) => {
  try {
    const bikes = await Bike.find({ isDeleted: false })
      .populate("owner", "name email");

    res.status(200).json({
      success: true,
      count: bikes.length,
      data: bikes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET SINGLE BIKE BY ID
 */
export const getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id)
      .populate("owner", "name email");

    if (!bike || bike.isDeleted) {
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

/**
 * UPDATE BIKE
 */
export const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike || bike.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Bike not found"
      });
    }

    // Optional: owner check
    if (bike.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this bike"
      });
    }

    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Bike updated successfully",
      data: updatedBike
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE BIKE (SOFT DELETE)
 */
export const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike || bike.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Bike not found"
      });
    }

    if (bike.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this bike"
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
