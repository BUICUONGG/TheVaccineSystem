import mongoose from "mongoose";

const vaccineInventorySchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  description: { type: String },
  manufacturer: { type: String, required: true }, // Nhà sản xuất
  createdAt: { type: String }, // Ngày tạo
  imageUrl: { type: String }, // url hinh anh
  category: { type: String },
  information: [
    {
      preventedDiseases: { type: String },
      eligibleGroups: { type: String },
      administrationRoute: { type: String },
      precautions: { type: String },
      reaction: { type: String },
    },
  ],
});

const VaccineInventory = mongoose.model(
  "VaccineInventory",
  vaccineInventorySchema
);
export default VaccineInventory;
