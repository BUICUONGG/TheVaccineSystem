import mongoose from "mongoose";

const appointmentGoiSchema = new mongoose.Schema({
  cusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child" },
  vaccinePackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccinePackage",
    required: true,
  },
  date: { type: String, required: true }, // Ngày khách đặt lịch (YYYY-MM-DD)
  doseSchedule: [
    {
      _id: false,
      doseNumber: { type: Number, required: true }, // Mũi tiêm thứ mấy
      date: { type: Date, required: true }, // Ngày tiêm dự kiến
      vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineInventory",
        required: true,
      },
      batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineImport", // Thông tin lô vaccine
        required: true,
      },
      price: { type: Number, required: true }, // 🔹 Giá của từng mũi trong gói
      status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
      },
    },
  ],
  createAt: { type: String, default: new Date().toLocaleDateString("vi-VN") },
  time: { type: String },
  note: { type: String, default: "" }, // 🔹 Ghi chú thêm về lịch hẹn
  status: {
    type: String,
    enum: ["completed", "incomplete", "pending", "approve"],
    default: "pending",
  },
});

const AppointmentGoi = mongoose.model("AppointmentGoi", appointmentGoiSchema);

export default AppointmentGoi;
