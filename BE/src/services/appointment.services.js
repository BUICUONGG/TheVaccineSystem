import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";
import AppointmentLe from "../model/appointmentSchemaLe.js";
import Child from "../model/childSchema.js";
import AppointmentGoi from "../model/appointmentSchemaGoi.js";

class AppointmentService {
  async listAptLe() {
    try {
      const listAptle = await connectToDatabase.appointmentLes.find().toArray();
      if (!listAptle) {
        throw new Error("khong thee in danh sach");
      }
      return listAptle;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async createAptLe(data) {
    try {
      const { cusId, childId, childInfo, vaccineId, date, createAt, status } =
        data;
      let finalChildId = childId;

      // Nếu không có childId, tạo mới Child
      if (!childId && childInfo) {
        const newChild = new Child({
          cusId,
          childName: childInfo.name || "", // Hoặc nhận từ data nếu có
          birthday: childInfo.birthday || "", // Chỉnh lại theo yêu cầu
          healthNote: childInfo.healthNote || "",
          gender: childInfo.gender || "", // Chỉnh lại theo yêu cầu
        });
        const saveChild = await connectToDatabase.childs.insertOne(newChild);
        finalChildId = saveChild.insertedId;
      }
      // console.log(finalChildId);
      const aptLe = new AppointmentLe({
        cusId,
        childId: finalChildId,
        vaccineId,
        date,
        createAt,
        status,
      });
      await aptLe.validate();
      // await aptLevalidate();
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

  async getAppointmentsWithDetails() {
    try {
      const appointments = await connectToDatabase.appointmentLes
        .find()
        .toArray();
      for (let appointment of appointments) {
        const customer = await connectToDatabase.customers.findOne({
          _id: appointment.cusId,
        });
        const vaccine = await connectToDatabase.vaccinceInventorys.findOne({
          _id: appointment.vaccineId,
        });
        appointment.customer = customer;
        appointment.vaccine = vaccine;
      }
      return appointments;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAppointmentsWithDetailsById(id) {
    try {
      const result = await connectToDatabase.appointmentLes.findOne({
        _id: new ObjectId(id),
      });

      if (!result) return null; // Kiểm tra nếu không có dữ liệu

      // Lấy thông tin customer và vaccine
      const customer = await connectToDatabase.customers.findOne({
        _id: result.cusId,
      });
      const vaccine = await connectToDatabase.vaccinceInventorys.findOne({
        _id: result.vaccineId,
      });

      // Gán thông tin vào result
      result.customer = customer;
      result.vaccine = vaccine;

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async searchAppointments(id) {
    try {
      const result = await connectToDatabase.appointmentLes.findOne({
        _id: new ObjectId(id),
      });
      if (!result) throw new Error("Khong tim thay hoa don nay");
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //-----------------------------------------------Gois-------------------------------------------------------------------------

  async listAptGoi() {
    try {
      const result = await connectToDatabase.appointmentGois.find().toArray();
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async showDetailAptGoi() {
    try {
      const appointments = await connectToDatabase.appointmentGois
        .find()
        .toArray();
      for (let appointment of appointments) {
        const customer = await connectToDatabase.customers.findOne({
          _id: appointment.cusId,
        });
        const vaccinePakage = await connectToDatabase.vaccinepackages.findOne({
          _id: appointment.vaccinePakageId,
        });
        const child = await connectToDatabase.childs.findOne({
          _id: appointment.childId,
        });
        appointment.customer = customer;
        appointment.vaccinePakage = vaccinePakage;
        appointment.child = child;

        delete appointment.cusId;
        delete appointment.vaccinePakageId;
        delete appointment.childId;
      }

      return appointments;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createAptGoi(data) {
    try {
      const {
        cusId,
        childId,
        childInfo,
        vaccinePakageId,
        date,
        createAt,
        status,
      } = data;
      let finalChildId = childId;

      // Nếu không có childId, tạo mới Child
      if (!childId && childInfo) {
        const newChild = new Child({
          cusId,
          childName: childInfo.name || "", // Hoặc nhận từ data nếu có
          birthday: childInfo.birthday || "", // Chỉnh lại theo yêu cầu
          healthNote: childInfo.healthNote || "",
          gender: childInfo.gender || "", // Chỉnh lại theo yêu cầu
        });
        const saveChild = await connectToDatabase.childs.insertOne(newChild);
        finalChildId = saveChild.insertedId;
      }
      console.log(finalChildId);
      const aptGoi = new AppointmentGoi({
        cusId,
        childId: finalChildId,
        vaccinePakageId,
        date,
        createAt,
        status,
      });
      await aptGoi.validate();
      // await aptLevalidate();
      const result = await connectToDatabase.appointmentGois.insertOne(aptGoi);
      return { _id: result.insertedId, ...data };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateAptGoi(id, updateGoi) {
    try {
      const result = await connectToDatabase.appointmentGois.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateGoi },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteGoi(id) {
    try {
      const result = await connectToDatabase.appointmentGois.findOneAndDelete({
        _id: new ObjectId(id),
      });
      return "Xoa thanh cong";
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const appointmentService = new AppointmentService();
export default appointmentService;
