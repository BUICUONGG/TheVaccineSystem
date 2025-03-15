import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";
import AppointmentLe from "../model/appointmentSchemaLe.js";
import Child from "../model/childSchema.js";
import AppointmentGoi from "../model/appointmentSchemaGoi.js";
import notiService from "./noti.services.js";
import { createZaloPayOrder } from "./zalopay.services.js";

class AppointmentService {
  // Kiểm tra tồn kho của vaccine
  async checkVaccineStock(vaccineId) {
    const vaccineImports = await connectToDatabase.vaccineImports
      .find({ "vaccines.vaccineId": new ObjectId(vaccineId) })
      .toArray();
    let totalStock = 0;
    for (const batch of vaccineImports) {
      for (const vaccine of batch.vaccines) {
        if (vaccine.vaccineId.toString() === vaccineId.toString()) {
          totalStock += vaccine.quantity;
        }
      }
    }
    return totalStock;
  }

  // Lấy lô vaccine gần hết hạn nhất còn hàng
  async getNearestExpiryBatch(vaccineId) {
    const vaccineImports = await connectToDatabase.vaccineImports
      .find({ "vaccines.vaccineId": new ObjectId(vaccineId) })
      .toArray();

    let selectedBatch = null;
    let nearestExpiryDate = null;

    for (const batch of vaccineImports) {
      for (const vaccine of batch.vaccines) {
        if (
          vaccine.vaccineId.toString() === vaccineId.toString() &&
          vaccine.quantity > 0
        ) {
          // Tách ngày, tháng, năm từ định dạng DD/MM/YYYY
          const [day, month, year] = vaccine.expiryDate.split("/");
          const expiryDate = new Date(year, month - 1, day); // Tháng trong JS bắt đầu từ 0

          if (!nearestExpiryDate || expiryDate < nearestExpiryDate) {
            nearestExpiryDate = expiryDate;
            selectedBatch = batch;
          }
        }
      }
    }
    return selectedBatch;
  }

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

  async createChildIfNotExists(cusId, childInfo) {
    const newChild = new Child({
      cusId,
      childName: childInfo.name || "",
      birthday: childInfo.birthday || "",
      healthNote: childInfo.healthNote || "",
      gender: childInfo.gender || "",
    });
    const saveChild = await connectToDatabase.childs.insertOne(newChild);
    return saveChild.insertedId; // Trả về ID của trẻ mới tạo
  }

  // Tạo lịch hẹn lẻ
  async createAptLe(data) {
    try {
      const { cusId, childId, childInfo, vaccineId, date, time, status, note } =
        data;
      let finalChildId = childId ? new ObjectId(childId) : null;

      //  Nếu không có childId và có childInfo => Tạo mới hồ sơ trẻ
      if (!finalChildId && childInfo && Object.keys(childInfo).length > 0) {
        finalChildId = await this.createChildIfNotExists(
          new ObjectId(cusId),
          childInfo
        );
      }
      // Kiểm tra tồn kho vaccine
      const totalStock = await this.checkVaccineStock(new ObjectId(vaccineId));
      if (totalStock <= 0) {
        throw new Error("Vaccine đã hết hàng, không thể đặt lịch.");
      }

      // Lấy lô vaccine gần hết hạn nhất
      const nearestBatch = await this.getNearestExpiryBatch(
        new ObjectId(vaccineId)
      );
      if (!nearestBatch) {
        throw new Error("Không tìm thấy lô vaccine phù hợp.");
      }

      // Tìm thông tin vaccine trong batch để lấy giá
      const vaccineBatchInfo = nearestBatch.vaccines.find(
        (v) => v.vaccineId.toString() === vaccineId.toString()
      );

      if (!vaccineBatchInfo) {
        throw new Error("Không tìm thấy vaccine trong lô nhập.");
      }

      const price = vaccineBatchInfo.unitPrice; // Lấy giá vaccine từ lô

      // Tạo lịch hẹn lẻ
      const aptLe = {
        cusId: new ObjectId(cusId),
        childId: finalChildId,
        vaccineId: new ObjectId(vaccineId),
        batchId: nearestBatch._id,
        date,
        time: time,
        createdAt: new Date().toLocaleDateString("vi-VN"),
        price,
        note: note || "",
        status: status || "pending",
      };

      // Lưu lịch hẹn vào DB
      const result = await connectToDatabase.appointmentLes.insertOne(aptLe);

      // Cập nhật số lượng vaccine trong kho
      await connectToDatabase.vaccineImports.updateOne(
        {
          _id: nearestBatch._id,
          "vaccines.vaccineId": new ObjectId(vaccineId),
        },
        { $inc: { "vaccines.$.quantity": -1 } }
      );

      //  Tạo thông báo với ID lịch hẹn thay vì object
      await notiService.createNoti({
        cusId: new ObjectId(cusId),
        apt: result.insertedId,
        aptModel: "AppointmentLe",
        message: `Lịch hẹn lẻ của bạn vào lúc ${time} đang trạng thái chờ duyệt`,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      });

      return {
        _id: result.insertedId,
        ...aptLe,
      };
    } catch (error) {
      console.error(error.message);
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
      // Xóa thông báo cũ cho appointment này
      await notiService.deleteNotiById(result._id);
      // Tạo thông báo mới
      await notiService.createNoti({
        cusId: result.cusId,
        apt: result._id,
        aptModel: "AppointmentLe",
        message: `Lịch hẹn le của bạn đã cập nhật trạng thái: ${updateAptLe.status}`,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
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

  async getAppointmentsWithDetailsById(id) {
    try {
      // Tìm lịch hẹn theo ID
      const result = await connectToDatabase.appointmentLes.findOne({
        _id: new ObjectId(id),
      });

      if (!result) return null; // Không tìm thấy lịch hẹn

      // Lấy thông tin customer
      const customer = await connectToDatabase.customers.findOne({
        _id: new ObjectId(result.cusId),
      });

      // Lấy thông tin child
      const child = await connectToDatabase.childs.findOne({
        _id: new ObjectId(result.childId),
      });

      // Lấy thông tin batch (Lô vaccine)
      const batch = await connectToDatabase.vaccineImports.findOne({
        _id: new ObjectId(result.batchId),
      });
      // Xóa các trường không cần thiết
      delete result.cusId;
      delete result.childId;
      delete result.batchId;
      delete result.vaccineId;

      return {
        ...result,
        customer,
        child,
        batch,
      };
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

  async getNearestExpiryBatches(vaccineIds) {
    const vaccineImports = await connectToDatabase.vaccineImports
      .find({
        "vaccines.vaccineId": { $in: vaccineIds.map((id) => new ObjectId(id)) },
      })
      .toArray();

    let selectedBatches = {};

    for (const vaccineId of vaccineIds) {
      let selectedBatch = null;
      let nearestExpiryDate = null;

      for (const batch of vaccineImports) {
        for (const vaccine of batch.vaccines) {
          if (
            vaccine.vaccineId.toString() === vaccineId.toString() &&
            vaccine.quantity > 0
          ) {
            const [day, month, year] = vaccine.expiryDate.split("/");
            const expiryDate = new Date(year, month - 1, day);

            if (!nearestExpiryDate || expiryDate < nearestExpiryDate) {
              nearestExpiryDate = expiryDate;
              selectedBatch = {
                batchId: batch._id,
                expiryDate: expiryDate,
                quantity: vaccine.quantity,
                unitPrice: vaccine.unitPrice,
              };
            }
          }
        }
      }

      if (selectedBatch) {
        selectedBatches[vaccineId.toString()] = selectedBatch;
      }
    }

    return selectedBatches;
  }

  async createAptGoi(data) {
    try {
      const {
        cusId,
        childId,
        childInfo,
        vaccinePackageId,
        date,
        time,
        note,
        status,
      } = data;
      let finalChildId = childId ? new ObjectId(childId) : null;

      // 🔹 Nếu không có childId nhưng có thông tin trẻ, tạo mới hồ sơ trẻ
      if (!finalChildId && childInfo) {
        finalChildId = await this.createChildIfNotExists(
          new ObjectId(cusId),
          childInfo
        );
      }

      // 🔹 Lấy thông tin gói vaccine
      const vaccinePackage = await connectToDatabase.vaccinepackages.findOne({
        _id: new ObjectId(vaccinePackageId),
      });
      if (!vaccinePackage) {
        throw new Error("Không tìm thấy gói vaccine.");
      }

      // 🔹 Tính lịch tiêm dự kiến từ ngày đặt lịch và lịch gói
      const doseSchedule = await this.calculateVaccinationSchedule(
        date,
        vaccinePackage.schedule
      );

      // 🔹 Gán vaccineId cho từng liều tiêm
      doseSchedule.forEach((dose, index) => {
        const vaccineData = vaccinePackage.vaccines[index]; // Lấy vaccine theo thứ tự
        if (vaccineData) {
          dose.vaccineId = vaccineData.vaccineId;
        } else {
          console.warn(`Không tìm thấy vaccine cho liều ${index + 1}`);
        }
      });

      // 🔹 Lấy danh sách vaccineId từ lịch tiêm (sau khi gán vaccineId)
      const vaccineIds = doseSchedule
        .map((dose) => dose.vaccineId)
        .filter(Boolean);

      // 🔹 Lấy thông tin lô vaccine gần hết hạn nhất
      const nearestBatches = await this.getNearestExpiryBatches(vaccineIds);

      let totalPrice = 0; // Tổng giá tiền của gói vaccine

      for (const dose of doseSchedule) {
        if (!dose.vaccineId) {
          continue; // Bỏ qua nếu không có vaccineId
        }

        const vaccineBatchInfo = nearestBatches[dose.vaccineId.toString()];
        if (!vaccineBatchInfo) {
          console.warn(
            `Không tìm thấy lô vaccine hợp lệ cho vaccine ID: ${dose.vaccineId}`
          );
          continue;
        }

        dose.batchId = vaccineBatchInfo.batchId;
        dose.price = vaccineBatchInfo.unitPrice;

        totalPrice += vaccineBatchInfo.unitPrice; // Cộng dồn vào tổng giá gói
      }

      // 🔹 Tạo lịch hẹn gói
      const aptGoi = {
        cusId: new ObjectId(cusId),
        childId: finalChildId,
        vaccinePackageId: new ObjectId(vaccinePackageId),
        date,
        doseSchedule,
        price: totalPrice,
        createdAt: new Date().toLocaleDateString("vi-VN"),
        time,
        note: note || "",
        status: status || "pending",
      };

      const result = await connectToDatabase.appointmentGois.insertOne(aptGoi);

      await notiService.createNoti({
        cusId: new ObjectId(cusId),
        apt: result.insertedId,
        aptModel: "AppointmentGoi",
        message: `Lịch hẹn gói của bạn vào ngày ${date} lúc ${time} đang trạng thái chờ duyệt`,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      });

      return {
        _id: result.insertedId,
        ...aptGoi,
      };
    } catch (error) {
      console.error("Lỗi trong createAptGoi:", error.message);
      throw new Error(error.message);
    }
  }
}
const appointmentService = new AppointmentService();
export default appointmentService;
