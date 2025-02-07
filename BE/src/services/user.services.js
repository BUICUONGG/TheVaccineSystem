import connectToDatabase from "../config/database.js";
import User from "../model/userSchema.js";
import mongoose from "mongoose";

class UserService {
  async addUser(userData) {
    const user = new User(userData);
    const result = await connectToDatabase.users.insertOne(user);
    return { _id: result.insertedId, ...userData };
  }

  async showData() {
    const result = await connectToDatabase.users.find().toArray();
    return result;
  }

  async login(email, password) {
    const user = await connectToDatabase.users.findOne({ email });
    if (user) {
      return "Email hoặc mật khẩu không đúng";
    } else {
      return "thanh cong ";
    }
  }
}
const userService = new UserService();
export default userService;
