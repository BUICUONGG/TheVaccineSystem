import { ClientSession } from "mongodb";
import connectToDatabase from "../config/database.js";
import User from "../model/userSchema.js";
import mongoose from "mongoose";
import { loginController } from "../controllers/users.controllers.js";

class UserService {
  async addUser(userData) {
    try {
      const user = new User(userData);
      await user.validate(); // Kiểm tra dữ liệu hợp lệ

      const result = await connectToDatabase.users.insertOne(user);
      return { _id: result.insertedId, ...userData };
    } catch (error) {
      console.error("Error adding user:", error.message);
      throw new Error(error.message); // Ném lỗi để controller xử lý
    }
  }

  async showData() {
    const result = await connectToDatabase.users.find().toArray();
    return result;
  }

  async login(email, password) {
    try {
      const user = await connectToDatabase.users.findOne({ email });
      if (!user) {
        throw new Error("Tài khoản không tồn tại", email);
      }
      const isValidPassword = await connectToDatabase.users.findOne({
        password,
      });

      if (!isValidPassword) {
        throw new Error("Sai mật khẩu");
      }
      return { _id: user._id, email: user.email };
    } catch (error) {
      console.error("Error login account:", error.message);
      throw new Error(error.message);
    }
  }

  // async checkEmailExists(email) {
  //   try {
  //     const user = await User.findOne({ email });
  //     return !!user; // Nếu user tồn tại, trả về true, ngược lại false
  //   } catch (error) {
  //     console.error("Error checking email:", error);
  //     throw new Error("Lỗi kiểm tra email");
  //   }
  // }
}
const userService = new UserService();
export default userService;
