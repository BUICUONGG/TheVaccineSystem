import mongoose from "mongoose";

const vaccinePackageSchema = new mongoose.Schema({
  packageName: { type: String, required: true, trim: true }, // Tên gói vaccine
  description: { type: String, trim: true }, // Mô tả gói vaccine
  vaccines: [
    {
      _id: false,
      vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineInventory",
        required: true, // Vaccine trong gói
      },
      quantity: { type: Number, required: true, min: 1 }, // Số liều vaccine trong gói
    },
  ],
  schedule: { type: [Number], required: true }, // Lịch tiêm theo số ngày từ mũi đầu tiên
  price: { type: Number, required: true, min: 0 }, // Giá gói vaccine
  category: { type: String, trim: true }, // Danh mục (VD: "Trẻ em", "Người lớn")
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  }, // Trạng thái gói vaccine
  createAt: { type: String, default: new Date().toLocaleDateString("vi-VN") }, // Ngày tạo gói vaccine
});
const VaccinePackage = mongoose.model("VaccinePackage", vaccinePackageSchema);

export default VaccinePackage;
