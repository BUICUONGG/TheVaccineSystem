import connectToDatabase from "../config/database.js";
import Staff from "../model/staffSchema.js";
import { ObjectId } from "mongodb";
class StaffService {
  async createStaff(data) {
    try {
      const staff = new Staff(data);
      await staff.validate();
      const result = await connectToDatabase.staffs.insertOne(staff);
      if (!result) throw new Error("Không tạo được staff");
      return { ...data, _id: result.insertedId };
    } catch (error) {
      console.error("Create staff error:", error);
      throw new Error(error.message);
    }
  }

  async listStaff() {
    try {
      const result = await connectToDatabase.staffs.find().toArray();
      if (!result) throw new Error("Danh sách staff trống");
      return result;
    } catch (error) {
      console.error("List staff error:", error);
      throw new Error(error.message);
    }
  }

  async updateStaff(id, dataUpdate) {
    try {
      // Remove staffId from dataUpdate to avoid duplicate field issues
      const { staffId, ...cleanDataUpdate } = dataUpdate;
      
      console.log(`Updating staff with ID: ${id}`);
      console.log("Update data:", cleanDataUpdate);
      
      const result = await connectToDatabase.staffs.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        { $set: cleanDataUpdate },
        { returnDocument: "after" }
      );
      
      if (!result) throw new Error("Cập nhật thất bại");
      return result;
    } catch (error) {
      console.log("Staff update error:", error.message);
      throw new Error(error.message);
    }
  }

  async deleteStaff(id) {
    try {
      console.log(`Deleting staff with ID: ${id}`);
      
      const result = await connectToDatabase.staffs.findOneAndDelete({
        _id: new ObjectId(id),
      });
      
      if (!result) throw new Error("Không tìm thấy nhân viên để xóa");
      return { message: "Xóa nhân viên thành công" };
    } catch (error) {
      console.error("Delete staff error:", error);
      throw new Error(error.message);
    }
  }
}

const staffService = new StaffService();
export default staffService;
