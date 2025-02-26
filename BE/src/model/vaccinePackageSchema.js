import mongoose from "mongoose";

const vaccinePackageSchema = new mongoose.Schema({
  packageName: { type: String, required: true }, // Tên gói vaccine
  description: { type: String }, // Mô tả gói vaccine
  vaccines: [
    {
      _id: false,
      vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineInventory",
        required: true, // Vaccine trong gói
      },
      quantity: { type: Number, required: true }, // Số liều của vaccine trong gói
    },
  ],
  price: { type: Number, required: true }, // Giá gói vaccine
  createdAt: { type: String }, // Ngày tạo gói vaccine
});
const VaccinePackage = mongoose.model("VaccinePackage", vaccinePackageSchema);

export default VaccinePackage;
