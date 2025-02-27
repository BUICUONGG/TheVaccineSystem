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
    },
  ],
  price: { type: Number, required: true }, // Giá nhập của từng loại vaccine
  importDate: { type: String, required: true }, // Ngày nhập kho
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Liên kết với bảng Admin
    required: true,
  },
  supplier: { type: String, required: true }, // Nhà cung cấp
  createdAt: { type: String }, // Ngày tạo
});

const VaccineImport = mongoose.model("VaccineImport", vaccineImportSchema);

export default VaccineImport;
