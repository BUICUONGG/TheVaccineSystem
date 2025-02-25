import connectToDatabase from "../config/database.js";
import Staff from "../model/staffSchema.js";

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

  async updateStaff(id, dataupdate) {
    try {
    } catch (error) {}
  }
}

const staffService = new StaffService();
export default staffService;
