import mongoose from "mongoose";

const vaccineInventorySchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  description: { type: String },
});
const VaccineInventory = mongoose.model(
  "VaccineInventory",
  vaccineInventorySchema
);

export default VaccineInventory;
