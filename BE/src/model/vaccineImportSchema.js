import mongoose from "mongoose";

const vaccineImportSchema = new mongoose.Schema({
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineInventory",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  mfgDate: { type: Date, required: true },
  expDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["in stock", "out of stock"],
    default: "in stock",
  },
});
const VaccineImport = mongoose.model("VaccineImport", vaccineImportSchema);

export default VaccineImport;
