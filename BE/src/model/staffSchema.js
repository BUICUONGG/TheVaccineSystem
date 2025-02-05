import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: String, required: true },
});
const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
