import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true,
  },
  childName: { type: String },
  birthday: { type: String },
  healthNote: { type: String }, // giống desprition mô tả
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "" },
});
const Child = mongoose.model("Child", childSchema);

export default Child;
