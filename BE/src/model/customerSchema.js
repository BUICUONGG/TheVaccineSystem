import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  customerName: { type: String, default: null },
  phone: { type: String, default: null },
  birthday: { type: String, default: null }, // Ngày sinh
  address: { type: String, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
});
const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
