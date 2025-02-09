import mongoose from "mongoose";

const vaccineInventorySchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  mfgDate: { type: Date, required: true },
  expDate: { type: Date, required: true },
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
