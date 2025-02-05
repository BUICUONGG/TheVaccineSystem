import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
});
const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
