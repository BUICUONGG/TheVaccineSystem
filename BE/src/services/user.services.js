import connectToDatabase from "../config/database.js";

class UserService {
  async showInfo() {
    const users = await connectToDatabase.users.find().toArray();
  }
}

const userService = new UserService();
export default userService;
