import mongoose from "mongoose";

const appointmentGoiSchema = new mongoose.Schema({
  cusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child" },
  vaccinePakageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccinePackage",
    required: true,
  },
  date: { type: String, required: true }, // ngayf cus nđặt lịch hẹn
  createAt: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "incomplete", "pending", "apporove"],
    default: "pending",
  },
});

const AppointmentGoi = mongoose.model("AppointmentGoi", appointmentGoiSchema);

export default AppointmentGoi;
