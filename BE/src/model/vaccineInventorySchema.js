import mongoose from "mongoose";

const vaccineInventorySchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  mfgDate: { type: String, required: true },
  expDate: { type: String, required: true },
  status: {
    type: String,
    enum: ["in stock", "out of stock"],
    default: "in stock",
  },
});
const VaccineInventory = mongoose.model(
  "VaccineInventory",
  vaccineInventorySchema
);

export default VaccineInventory;
