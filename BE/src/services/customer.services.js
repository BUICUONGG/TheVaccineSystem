import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";

class CustomerService {
  async getOneCustomer(id) {
    try {
      const result = await connectToDatabase.customers.findOne({
        userId: new ObjectId(id),
      });
      if (!result) {
        throw new Error("Không có customer nào");
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

      // Lọc user hợp lệ (không phải admin hoặc staff)
      const userMap = new Map(
        users
          .filter((user) => user.role !== "admin" && user.role !== "staff")
          .map((user) => [user._id.toString(), user.username])
      );

      // Chỉ gán username nếu có, không thì giữ nguyên customer
      const result = customers.map(({ userId, ...customer }) => {
        const username = userMap.get(userId?.toString());
        return username ? { ...customer, username } : customer;
      });
      if (!result) throw new Error("Khong thể show được ");
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

  async getAptleAndAptGoiByCusId(cusId) {
    try {
      ///Lấy thông tin lẻ
      const aptLes = await connectToDatabase.appointmentLes.findOne({
        cusId: new ObjectId(cusId),
      });

      const cus = await connectToDatabase.customers.findOne({
        _id: aptLes.cusId,
      });
      const vaccine = await connectToDatabase.vaccinceInventorys.findOne({
        _id: aptLes.vaccineId,
      });
      const child = await connectToDatabase.childs.findOne({
        _id: aptLes.childId,
      });
      aptLes.customer = cus;
      aptLes.vaccine = vaccine;
      aptLes.child = child;
      delete aptLes.cusId;
      delete aptLes.childId;
      delete aptLes.vaccineId;

      // //lấy thông tin Gói
      const aptGois = await connectToDatabase.appointmentGois.findOne({
        cusId: new ObjectId(cusId),
      });
      const customer = await connectToDatabase.customers.findOne({
        _id: aptGois.cusId,
      });

      const childd = await connectToDatabase.childs.findOne({
        _id: aptGois.childId,
      });

      const vaccinee = await connectToDatabase.vaccinepackages.findOne({
        _id: aptGois.vaccinePakageId,
      });
      aptGois.customer = customer;
      aptGois.vaccine = vaccinee;
      aptGois.child = childd;
      delete aptGois.cusId;
      delete aptGois.childId;
      delete aptGois.vaccinePakageId;

      return { aptGois, aptLes };
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

const customerService = new CustomerService();
export default customerService;
