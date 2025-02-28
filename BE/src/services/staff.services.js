import connectToDatabase from "../config/database.js";
import Staff from "../model/staffSchema.js";
import { ObjectId } from "mongodb";
class StaffService {
  async createStaff(data) {
    try {
      const staff = new Staff(data);
      await staff.validate();
      const result = await connectToDatabase.staffs.insertOne(staff);
      return { ...data };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async listStaff() {
    try {
      const result = await connectToDatabase.staffs.find().toArray();
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateStaff(id, dataUpdate) {
    try {
      const result = await connectToDatabase.staffs.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        { $set: dataUpdate },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteStaff(id) {
    try {
      const result = await connectToDatabase.staffs.findOneAndDelete({
        _id: new ObjectId(id),
      });
      return "Xoa thanh cong";
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const staffService = new StaffService();
export default staffService;
