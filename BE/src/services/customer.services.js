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

  async getCustomerById(id) {
    try {
      const result = await connectToDatabase.customers.findOne({
        _id: new ObjectId(id),
      });
      if (!result) {
        throw new Error("Không tìm thấy khách hàng");
      }
      return result;
    } catch (error) {
      console.error("Error finding customer by ID:", error);
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
      const result = customers.map((customer) => {
        const customerId = customer._id;
        const { userId, ...customerData } = customer;

        const username = userMap.get(userId?.toString());

        return {
          ...customerData,
          _id: customerId,
          userId: userId,
          username: username || "Unknown",
        };
      });

      if (!result) throw new Error("Khong thể show được ");
      console.log("getAllCustomer result sample:", result[0]);
      return result;
    } catch (error) {
      console.log("Lỗi:", error.message);
      throw new Error(error.message);
    }
  }

  async updateCustomer(customerId, updateData) {
    try {
      console.log("Update customer request:", { customerId, updateData });

      // Check if customerId is a customer ID or a user ID
      // Try to find a customer directly by _id first
      const customerById = await connectToDatabase.customers.findOne({
        _id: new ObjectId(customerId),
      });

      if (customerById) {
        console.log("Found customer by _id");
        const result = await connectToDatabase.customers.findOneAndUpdate(
          { _id: new ObjectId(customerId) },
          { $set: updateData },
          { returnDocument: "after" }
        );
        return result;
      } else {
        // If not found, try to find by userId
        console.log("Trying to find customer by userId");
        const result = await connectToDatabase.customers.findOneAndUpdate(
          { userId: new ObjectId(customerId) },
          { $set: updateData },
          { returnDocument: "after" }
        );
        return result;
      }
    } catch (error) {
      console.log("Error updating customer:", error.message);
      throw new Error(error.message);
    }
  }

  async getAptleAndAptGoiByCusId(cusId) {
    try {
      const objectId = new ObjectId(cusId);

      // Lấy tất cả thông tin lẻ
      const aptLes = await connectToDatabase.appointmentLes
        .find({ cusId: objectId })
        .toArray();

      // Lấy tất cả thông tin gói
      const aptGois = await connectToDatabase.appointmentGois
        .find({ cusId: objectId })
        .toArray();

      // Lấy thông tin chi tiết cho từng đơn lẻ
      for (const aptLe of aptLes) {
        aptLe.customer = await connectToDatabase.customers.findOne({
          _id: aptLe.cusId,
        });
        aptLe.vaccine = await connectToDatabase.vaccinceInventorys.findOne({
          _id: aptLe.vaccineId,
        });
        if (aptLe.childId) {
          aptLe.child = await connectToDatabase.childs.findOne({
            _id: aptLe.childId._id,
          });
        }
        delete aptLe.cusId;
        delete aptLe.childId;
        delete aptLe.vaccineId;
      }

      // Lấy thông tin chi tiết cho từng đơn gói
      for (const aptGoi of aptGois) {
        aptGoi.customer = await connectToDatabase.customers.findOne({
          _id: aptGoi.cusId,
        });
        aptGoi.vaccine = await connectToDatabase.vaccinepackages.findOne({
          _id: aptGoi.vaccinePakageId,
        });
        if (aptGoi.childId) {
          aptGoi.child = await connectToDatabase.childs.findOne({
            _id: aptGoi.childId._id,
          });
        }
        delete aptGoi.cusId;
        delete aptGoi.childId;
        delete aptGoi.vaccinePakageId;
      }

      return { aptLes, aptGois };
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

const customerService = new CustomerService();
export default customerService;
