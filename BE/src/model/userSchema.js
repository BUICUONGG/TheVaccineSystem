import mongoose from "mongoose";

// Users Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fullname: { type: String, require: true },
  email: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "staff", "customer"],
    default: "customer",
  },
});

const User = mongoose.model("User", userSchema);
export default User;
