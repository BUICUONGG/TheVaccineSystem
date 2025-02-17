import mongoose from "mongoose";

const vaccineImportSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true }, // Mã số lô vaccine
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineInventory",
    required: true, // Liên kết với VaccineInventory
  },
  quantity: { type: Number, required: true }, // Số lượng vaccine nhập trong lô
  price: { type: Number, required: true }, // Giá nhập
  mfgDate: { type: String, required: true }, // Ngày sản xuất
  expDate: { type: String, required: true }, // Ngày hết hạn
  importDate: { type: String, required: true }, // Ngày nhập kho
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true, // Người nhập vaccine
  },
  supplier: { type: String, required: true }, // Nhà cung cấp vaccine
  createdAt: { type: String }, // Ngày tạo
});

const VaccineImport = mongoose.model("VaccineImport", vaccineImportSchema);

export default VaccineImport;
