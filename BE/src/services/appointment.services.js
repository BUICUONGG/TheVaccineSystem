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
        throw new Error("Danh sách trống");
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
          childName: childInfo.name || "",
          birthday: childInfo.birthday || "",
          healthNote: childInfo.healthNote || "",
          gender: childInfo.gender || "",
        });
        const saveChild = await connectToDatabase.childs.insertOne(newChild);
        finalChildId = saveChild.insertedId;
      }

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
      if (!result) {
        throw new Error("Không thể tạo appointment Lẻ");
      }
      return { _id: result.insertedId, ...data };
    } catch (error) {
      console.log(error.message);
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
        throw new Error("Không thể cập nhật/ Cập nhật lỗi");
      }
      return result;
    } catch (error) {
      console.log(error.message);
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
      console.log(error.message);
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
      if (!appointments) {
        throw new Error("Không thể xem chi tiết");
      }
      return appointments;
    } catch (error) {
      console.log(error.message);
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
      if (!result) {
        throw new Error(`Không tìm thấy đơn này ${id}`);
      }
      return result;
    } catch (error) {
      console.log(error.message);
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
      if (!result) throw new Error("Danh sách trống");
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async showDetailAptGoi() {
    try {
      const appointments = await connectToDatabase.appointmentGois
        .find()
        .toArray();
      if (!appointments) {
        throw new Error(
          "Danh sachs trống / Không lấy được danh dách appointment"
        );
      }
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
      if (!appointments) {
        throw new Error("Khoong thể show");
      }
      return appointments;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  // tinh ngay tiem
  async calculateVaccinationSchedule(startDate, schedule) {
    if (!startDate || typeof startDate !== "string") {
      throw new Error("Ngày bắt đầu không hợp lệ!");
    }

    const [day, month, year] = startDate.split("/");
    let lastDate = new Date(`${year}-${month}-${day}`); // Chuyển sang Date object đúng

    let dates = [];

    schedule.forEach((days, index) => {
      let nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + days);

      // Chuyển lại về dạng "dd/mm/yyyy"
      let nextDay = nextDate.getDate().toString().padStart(2, "0");
      let nextMonth = (nextDate.getMonth() + 1).toString().padStart(2, "0");
      let nextYear = nextDate.getFullYear();

      dates.push({
        doseNumber: index + 1, // Mũi tiêm thứ mấy
        date: `${nextDay}/${nextMonth}/${nextYear}`, // Giữ nguyên định dạng
        status: "pending",
      });

      lastDate = nextDate;
    });
    return dates;
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
          childName: childInfo.name || "",
          birthday: childInfo.birthday || "",
          healthNote: childInfo.healthNote || "",
          gender: childInfo.gender || "",
        });
        const saveChild = await connectToDatabase.childs.insertOne(newChild);
        finalChildId = saveChild.insertedId;
      }

      const vaccinePackage = await connectToDatabase.vaccinepackages.findOne({
        _id: new ObjectId(vaccinePakageId),
      });

      const doseSchedule = await this.calculateVaccinationSchedule(
        date,
        vaccinePackage.schedule
      );
      if (!doseSchedule) {
        throw new Error("Không thể tính được chu kì tiêm");
      }

      const aptGoi = new AppointmentGoi({
        cusId,
        childId: finalChildId,
        vaccinePakageId,
        date,
        doseSchedule,
        createAt,
        status,
      });
      // await aptGoi.validate();
      const result = await connectToDatabase.appointmentGois.insertOne(aptGoi);
      if (!result) throw new Error("không thể tạo appointment Gói");
      return { _id: result.insertedId, doseSchedule, ...data };
    } catch (error) {
      console.log(error.message);
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
      if (!result) throw new Error("Không thể cập nhật Gói");
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async deleteGoi(id) {
    try {
      const result = await connectToDatabase.appointmentGois.findOneAndDelete({
        _id: new ObjectId(id),
      });
      if (!result) throw new Error("Không xoá được / xoá không thành công");
      return "Xoa thanh cong";
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

const appointmentService = new AppointmentService();
export default appointmentService;
