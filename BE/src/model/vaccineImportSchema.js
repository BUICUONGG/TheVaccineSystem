import mongoose from "mongoose";

const vaccineImportSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true }, // tên lô vaccine giống như là khoá chính nhưng dùng để dễ tìm hơn
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineInventory",
    quantity: { type: Number, required: true }, // số lượng vaccine này trong kho
    required: true,
  },
  price: { type: Number, required: true },
  mfgDate: { type: String, required: true },
  expDate: { type: String, required: true },
  importDate: { type: String, required: true }, // lưu date string theo kiểu DD/MM/YYY
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  supplier: { type: String, required: true }, //công ty sản xuất, nhà cung cấp
});

const VaccineImport = mongoose.model("VaccineImport", vaccineImportSchema);

export default VaccineImport;
