import connectToDatabase from "../config/database.js";
import User from "../model/userSchema.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
// import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import "dotenv/config";
import { signToken } from "../utils/jwt.js";
import "dotenv/config";

class UserService {
  //đăng kí tài khoản chỉ cần username password và email thôi. tự động lưu vào bảng customer khi nào cần cập nhật thông tin thì vào đó cập nhật sau
  async resgister(userData) {
    try {
      userData.password = await hashPassword(userData.password);
      const user = new User(userData);
      await user.validate(); // Kiểm tra dữ liệu hợp lệ
      const result = await connectToDatabase.users.insertOne(user);
      const customerData = {
        userId: result.insertedId,
        customerName: "", // Nếu user có name thì lấy
        phone: "",
        address: "",
        gender: "", // Liên kết với user
        birthday: "",
      };
      await connectToDatabase.customers.insertOne(customerData);
      return { _id: result.insertedId, ...userData };
    } catch (error) {
      console.error("Không tạo được tài khoản", error.message);
      throw new Error(error.message); // Ném lỗi để controller xử lý
    }
  }

  async showDataUser() {
    try {
      const result = await connectToDatabase.users.find().toArray();
      if (!result || result.length === 0) {
        throw new Error("Không có dữ liệu child");
      }
      return result;
    } catch (error) {
      console.error("Display data error:", error);
      throw new Error(error.message);
    }
  }

  async signAccessToken(user) {
    return await signToken({
      payload: { id: user._id.toString(), role: user.role },
      privateKey: process.env.JWT_ACCESS_TOKEN,
      options: { expiresIn: "5h" },
    });
  }

  async signRefreshToken(user) {
    return await signToken({
      payload: { id: user._id.toString(), role: user.role },
      privateKey: process.env.JWT_REFRESH_TOKEN,
      options: { expiresIn: "5h" },
    });
  }

  async login(username, password) {
    try {
      const user = await connectToDatabase.users.findOne({
        username,
      });
      if (!user) {
        throw new Error("Tài khoản không tồn tại", username);
      }
      const userId = user._id.toString();
      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        throw new Error("Sai mật khẩu");
      }
      if (user && validPassword) {
        const accesstoken = await this.signAccessToken(user);
        const refreshtoken = await this.signRefreshToken(user);

        // Lưu refreshToken vào database
        await connectToDatabase.users.updateOne(
          { _id: user._id },
          { $set: { refreshToken: refreshtoken } }
        );

        return {
          userId,
          role: user.role,
          accesstoken,
          refreshtoken,
        };
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
        throw new Error(`Không tìm thấy user với id: ${userId}`);
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

  async logout(id) {
    try {
      const result = await connectToDatabase.users.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { refreshToken: "" } },
        { returnDocument: "after" }
      );
      if (!result) {
        console.warn(`Không tìm thấy user với id: ${id}`);
        return null;
      }
      return result;
    } catch (error) {
      console.error("Lỗi khi logout:", error);
      return null;
    }
  }
}
const userService = new UserService();
export default userService;
