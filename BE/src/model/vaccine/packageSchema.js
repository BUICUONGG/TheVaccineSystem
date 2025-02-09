import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  packageName: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available",
  },
});
const Package = mongoose.model("Package", packageSchema);

export default Package;
