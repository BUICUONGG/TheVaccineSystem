import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true }, //taif khoản
  password: { type: String, required: true }, //mk
  role: "admin",
});
//tạo admin chỉ cần tài khoản và mk không cần thứ khác

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
