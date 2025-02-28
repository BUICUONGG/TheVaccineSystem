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
  doseSchedule: [
    {
      _id: false,
      doseNumber: { type: Number, required: true }, // Mũi tiêm thứ mấy
      date: { type: String, required: true }, // Ngày tiêm dự kiến (YYYY-MM-DD)
      status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
      },
    },
  ],
  createAt: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "incomplete", "pending", "approve"],
    default: "pending",
  },
});

const AppointmentGoi = mongoose.model("AppointmentGoi", appointmentGoiSchema);

export default AppointmentGoi;
