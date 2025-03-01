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
      // Using aggregation to join with users collection to get username
      const result = await connectToDatabase.customers.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        {
          $addFields: {
            username: { $arrayElemAt: ["$userInfo.username", 0] }
          }
        },
        {
          $project: {
            userInfo: 0 // Remove the userInfo array from results
          }
        }
      ]).toArray();
      
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
