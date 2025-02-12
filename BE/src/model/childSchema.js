import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  childName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  healthNote: { type: String },
});
const Child = mongoose.model("Child", childSchema);

export default Child;
