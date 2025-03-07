import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  cusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  apt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ["AppointmentLe", "AppointmentGoi"],
    required: true,
  },
  message: { type: String, required: true },
  createdAt: { type: String },
});

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
