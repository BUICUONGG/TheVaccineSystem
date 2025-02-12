import connectToDatabase from "../config/database.js";
import User from "../model/userSchema.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
// import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import "dotenv/config";
import { signToken } from "../utils/jwt.js";

class UserService {
  async resgister(userData) {
    try {
      userData.password = await hashPassword(userData.password);
      const user = new User(userData);
      await user.validate(); // Kiểm tra dữ liệu hợp lệ
      const result = await connectToDatabase.users.insertOne(user);
      return { _id: result.insertedId, ...userData };
    } catch (error) {
      console.error("Không tạo được tài khoản", error.message);
      throw new Error(error.message); // Ném lỗi để controller xử lý
    }
  }

  async showData() {
    try {
      const result = await connectToDatabase.users.find().toArray();
      if (!result) {
        throw new Error("Không có dữ liệu");
      }
      return result;
    } catch (error) {
      console.error("Display data error:", error);
      throw new Error(error.message);
    }
  }

  async login(username, password) {
    try {
      const user = await connectToDatabase.users.findOne({ username });
      if (!user) {
        throw new Error("Tài khoản không tồn tại", username);
      }
      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        throw new Error("Sai mật khẩu");
      }
      if (user && validPassword) {
        const accesstoken = await signToken({
          payload: { id: user._id.toString(), role: user.role },
          privateKey: process.env.JWT_ACCESS_TOKEN,
          options: { expiresIn: "1h" },
        });

        return { accesstoken };
      }
    } catch (error) {
      console.error("Error login account:", error.message);
      throw new Error(error.message);
    }
  }

  async delete(userId) {
    try {
      // console.log(userId);
      const user = await connectToDatabase.users.findOneAndDelete({
        _id: new ObjectId(userId),
      });
      if (!user) {
        throw new Error("User not found");
      }
      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error(error.message);
    }
  }

  async update(id, updateData) {
    try {
      const result = await connectToDatabase.users.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result) {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error(error.message);
    }
  }

  async getAllUsers() {
    try {
      const users = await connectToDatabase.users.aggregate([
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "userId",
            as: "customerInfo"
          }
        },
        {
          $project: {
            _id: 1,
            fullname: 1,
            email: 1,
            customerInfo: 1
          }
        }
      ]).toArray();
      
      return users;
    } catch (error) {
      console.error("Get all users error:", error);
      throw new Error(error.message);
    }
  }
}
const userService = new UserService();
export default userService;
