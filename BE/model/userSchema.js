import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: String,
  age: Number,
});

const User = mongoose.model("User", userSchema);
export default User;
