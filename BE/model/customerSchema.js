import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gender: { type: String },
  customerId: { type: String },
});
const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
