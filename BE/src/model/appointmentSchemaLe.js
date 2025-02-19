import mongoose from "mongoose";

const appointmentLeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    default: "incoplete",
  },
});
const AppointmentLe = mongoose.model("AppointmentLe", appointmentLeSchema);

export default AppointmentLe;
