import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  vaccineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VaccineInventory",
    required: true,
  },
});
const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
