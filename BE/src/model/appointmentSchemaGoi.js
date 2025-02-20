import mongoose from "mongoose";

const appointmentGoiSchema = new mongoose.Schema({
  cusIds: {
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
    enum: ["completed", "incoplete"],
    default: "incoplete",
  },
});

const AppointmentGoi = mongoose.model("AppointmentGoi", appointmentGoiSchema);

export default AppointmentGoi;
