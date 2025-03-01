import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";

class CustomerService {
  async getOneCustomer(id) {
    try {
      const result = await connectToDatabase.customers.findOne({
        userId: new ObjectId(id),
      });
      if (!result) {
        throw new Error("khong cos customer nao");
      }
      return result;
    } catch (error) {
      console.log("Khong co cus", error);
      throw new Error(error.message);
    }
  }

  async getAllCustomer() {
    try {
      const customers = await connectToDatabase.customers.find().toArray();
      const users = await connectToDatabase.users.find().toArray();

      if (!customers.length) {
        throw new Error("Không có ai");
      }

      const userMap = new Map(
        users.map((user) => [user._id.toString(), user.username])
      );

      const result = customers.map((customer) => ({
        ...customer,
        username:
          userMap.get(customer.userId?.toString()) || "Không có username",
      }));

      return result;
    } catch (error) {
      console.log("Lỗi:", error.message);
      throw new Error(error.message);
    }
  }

  async updateCustomer(customerId, updateData) {
    try {
      const result = await connectToDatabase.customers.findOneAndUpdate(
        { userId: new ObjectId(customerId) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      console.log("Khong the update");
      throw new Error(error.message);
    }
  }
}

const customerService = new CustomerService();
export default customerService;
