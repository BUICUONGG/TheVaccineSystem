import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  staffname: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"] },
  role: { type: String, default: "staff" },
});
const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
