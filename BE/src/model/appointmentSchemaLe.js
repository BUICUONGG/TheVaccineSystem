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
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineImport", // Thông tin lô vaccine
    required: true,
  },
  date: { type: String, required: true }, // Ngày khách đặt lịch (Date thay vì String)
  createdAt: { type: String, default: new Date().toLocaleDateString("vi-VN") }, // Mặc định là ngày hiện tại
  time: { type: String },
  price: { type: Number, required: true }, // 🔹 Giá tiêm lẻ
  note: { type: String, default: "" }, // 🔹 Ghi chú thêm về lịch hẹn
  status: {
    type: String,
    enum: ["completed", "incomplete", "pending", "approve"],
    default: "pending",
  },
});

const AppointmentLe = mongoose.model("AppointmentLe", appointmentLeSchema);
export default AppointmentLe;
