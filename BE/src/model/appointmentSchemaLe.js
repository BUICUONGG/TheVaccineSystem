import mongoose from "mongoose";

const appointmentLeSchema = new mongoose.Schema({
  cusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  date: { type: String, required: true }, // ngayf đặt lịch hẹn
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineInventory",
    required: true,
  },
  createAt: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "incomplete"],
    default: "incomplete",
  },
});

const AppointmentLe = mongoose.model("AppointmentLe", appointmentLeSchema);
export default AppointmentLe;
