import mongoose from "mongoose";

const vaccineImportSchema = new mongoose.Schema({
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineInventory",
    required: true,
  },
  quantity: { type: Number, required: true },
  batchNumber: { type: String, required: true },
  importPrice: { type: Number, required: true },
  mfgDate: { type: Date, required: true },
  expDate: { type: Date, required: true },
  importDate: { type: Date, default: Date.now },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
});

const VaccineImport = mongoose.model("VaccineImport", vaccineImportSchema);

export default VaccineImport;
