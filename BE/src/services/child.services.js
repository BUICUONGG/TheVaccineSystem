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
      const child = new Child(childData);
      await child.validate();
      const result = await connectToDatabase.childs.insertOne(child);
      return { _id: result.insertedId, ...childData };
    } catch (error) {
      console.error("Create child error:", error);
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
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteChild(id) {
    try {
      return (result = await connectToDatabase.childs.findOneAndDelete({
        _id: new ObjectId(id),
      }));
    } catch (error) {
      throw new Error("Server ko the xoa");
    }
  }
}

const childService = new ChildService();
export default childService;
