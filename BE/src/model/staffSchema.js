import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  staffname: { type: String, default: null },
  phone: { type: String, default: null },
  gender: { type: String, enum: ["male", "female", "other"] },
});
const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
