import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true,
  },
  childName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  healthNote: { type: String }, // giống desprition mô tả
});
const Child = mongoose.model("Child", childSchema);

export default Child;
