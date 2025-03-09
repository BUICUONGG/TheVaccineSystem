import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  cusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  apt: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "aptModel", // Tham chiếu động
  },
  aptModel: {
    type: String,
    enum: ["AppointmentLe", "AppointmentGoi"], // Các model hợp lệ
  },
  message: { type: String, required: true },
  createdAt: { type: String },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
