import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
