import mongoose from "mongoose";

const vaccineInventorySchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  description: { type: String },
  manufacturer: { type: String, required: true }, // Nhà sản xuất
  createdAt: { type: String }, // Ngày tạo
});

const VaccineInventory = mongoose.model(
  "VaccineInventory",
  vaccineInventorySchema
);
export default VaccineInventory;
