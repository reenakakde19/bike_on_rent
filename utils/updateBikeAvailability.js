import Bike from "../models/bike.js";

export const setBikeAvailability = async (bikeId, isAvailable) => {
  await Bike.findByIdAndUpdate(bikeId, { isAvailable });
};
