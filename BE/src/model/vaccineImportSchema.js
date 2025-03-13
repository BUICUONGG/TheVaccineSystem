import mongoose from "mongoose";

const vaccineImportSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true }, // Mã số lô
  vaccines: [
    {
      _id: false,
      vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineInventory", // Mối liên kết với VaccineInventory
        required: true,
      },
      quantity: { type: Number, required: true }, // Số lượng mỗi loại vaccine trong lô
      expiryDate: { type: String, required: true }, // Ngày hết hạn (DD/MM/YYYY)
      unitPrice: { type: Number, required: true }, // Giá của từng vaccine trong lô
    },
  ],
  totalPrice: { type: Number, required: true }, // Tổng giá trị của cả lô nhập
  importDate: { type: String, required: true }, // Ngày nhập kho (DD/MM/YYYY)
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Liên kết với bảng Admin
    required: true,
  },
  supplier: { type: String, required: true }, // Nhà cung cấp
  createdAt: { type: String, default: new Date().toLocaleDateString("vi-VN") }, // Ngày tạo (mặc định là ngày hiện tại)
});

const VaccineImport = mongoose.model("VaccineImport", vaccineImportSchema);

export default VaccineImport;
