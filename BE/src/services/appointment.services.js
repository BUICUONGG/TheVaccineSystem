import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";

class AppointmentService {
  async listAptLe() {
    try {
      const listAptle = await connectToDatabase.appointmentLes.find().toArray();
      if (!listAptle) {
        throw new Error("khong thee in danh sach");
      }
      return listAptle;
    } catch (error) {
      console.log("loi o service");
      throw new Error(error.message);
    }
  }

  async createAptLe(data) {
    try {
      const aptLe = new AppointmentLe(data);
      await aptLe.validate();
      const result = await connectToDatabase.appointmentLes.insertOne(aptLe);
      return { _id: result.insertedId, ...data };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateAptLe(id, updateAptLe) {
    try {
      const result = await connectToDatabase.appointmentLes.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateAptLe },
        { returnDocument: "after" }
      );
      if (!result) {
        throw new Error("Không thể update");
      }
      return result;
    } catch (error) {
      throw new Error(error.message); // Ném lỗi chỉ khi có lỗi xảy ra
    }
  }

  async deleteAptLe(id) {
    try {
      const result = await connectToDatabase.appointmentLes.findOneAndDelete({
        _id: new ObjectId(id),
      });
      if (!result) throw new Error("Khong tim thay id nay");
      return { message: "Delete successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const appointmentService = new AppointmentService();
export default appointmentService;
