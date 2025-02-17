import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";

class CustomerService {
  async getOneCustomer(id) {
    try {
      const result = await connectToDatabase.customers.findOne({
        userId: new ObjectId(id),
      });
      if (!result) {
        throw new Error("khong cos customer nao", error);
      }
      return result;
    } catch (error) {
      console.log("Khong co cus", error);
      throw new Error(error.message);
    }
  }

  async getAllCustomer() {
    try {
      const result = await connectToDatabase.customers.find().toArray();
      if (!result) {
        throw new Error("Khong co ai");
      }
      return result;
    } catch (error) {
      console.log("trong danh sach khong co ai");
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
