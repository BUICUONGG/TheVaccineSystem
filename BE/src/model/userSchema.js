import mongoose from "mongoose";

// Users Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["customer", "admin", "staff"],
    default: "customer",
  },
  refreshToken: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);
export default User;
