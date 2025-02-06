import connectToDatabase from "../config/database.js";
import User from "../model/userSchema.js";

class UserService {
  async addUser(userData) {
    const user = new User(userData);
    const result = await connectToDatabase.users.insertOne(user);
    return "Them thanh cong";
  }
}

const userService = new UserService();
export default userService;
