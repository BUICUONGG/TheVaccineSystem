import mongoose from "mongoose";

const appointmentLeSchema = new mongoose.Schema({
  cusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child" },
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineInventory",
    required: true,
  },

  date: { type: String, required: true }, // ngayf cus nđặt lịch hẹn
  createAt: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "incomplete", "pending", "approve"],
    default: "pending",
  },
});

const AppointmentLe = mongoose.model("AppointmentLe", appointmentLeSchema);
export default AppointmentLe;
