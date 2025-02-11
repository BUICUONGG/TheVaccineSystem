import connectToDatabase from "../config/database.js";
import User from "../model/userSchema.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import "dotenv/config";

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
    const result = await connectToDatabase.users.find().toArray();
    return result;
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
        const accesstoken = jwt.sign(
          { id: user._id.toString(), role: user.role },
          process.env.JWT_ACCESS_TOKEN,
          {
            expiresIn: "1h",
          }
        );

        return { user, accesstoken };
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
}
const userService = new UserService();
export default userService;
