import mongoose from "mongoose";

const vaccinePackageSchema = new mongoose.Schema({
  packageName: { type: String, required: true }, // Tên gói vaccine
  description: { type: String }, // Mô tả gói vaccine
  vaccines: [
    {
      vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineInventory",
        required: true, // Vaccine trong gói
      },
      quantity: { type: Number, required: true }, // Số liều của vaccine trong gói
    },
  ],
  price: { type: Number, required: true }, // Giá gói vaccine
  createdAt: { type: Date, default: Date.now }, // Ngày tạo gói vaccine
});
const Package = mongoose.model("Package", vaccinePackageSchema);

export default Package;
