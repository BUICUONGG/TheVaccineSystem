import connectToDatabase from "../config/database.js";
import Child from "../model/childSchema.js";
import { ObjectId } from "mongodb";

class ChildService {
  async showData() {
    try {
      const result = await connectToDatabase.childs.find().toArray();
      if (!result || result.length === 0) {
        throw new Error("Không có dữ liệu child");
      }
      return result;
    } catch (error) {
      console.error("Display data error:", error);
      throw new Error(error.message);
    }
  }

  async create(childData) {
    try {
      if (childData.customerId) {
        childData.customerId = new ObjectId(childData.customerId);
      }
      const result = await connectToDatabase.childs.insertOne(childData);
      if (!result) throw new Error("Không tạo được child");
      return { _id: result.insertedId, ...childData };
    } catch (error) {
      console.error("Create child error:", error.message);
      throw new Error(error.message);
    }
  }

  async updateChild(id, dataUpdate) {
    try {
      const result = await connectToDatabase.childs.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        { $set: dataUpdate },
        { returnDocument: "after" }
      );
      if (!result) throw new Error("Không cập nhật được child");
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async deleteChild(id) {
    try {
      const result = await connectToDatabase.childs.findOneAndDelete({
        _id: new ObjectId(id),
      });
      if (!result) {
        throw new Error("Không tìm thấy bản ghi để xóa");
      }
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getAllChildByCusId(cusId) {
    try {
      const result = connectToDatabase.childs
        .find({
          customerId: new ObjectId(cusId),
        })
        .toArray();

      if (!result) {
        throw new Error("Không có thông tin trẻ cho người dùng này");
      }
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

const childService = new ChildService();
export default childService;
