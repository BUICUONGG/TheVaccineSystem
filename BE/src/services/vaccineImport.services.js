import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";
import VaccineImport from "../model/vaccineImportSchema.js";
class VaccineImportService {
  async getFullData() {
    try {
      return (result = await connectToDatabase.vaccineImports.find().toArray());
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOneById(id) {
    try {
      const result = await connectToDatabase.vaccineImports.findOne({
        _id: new ObjectId(id),
      });
      return result;
    } catch (error) {
      throw new Error("Khong tim thay thong tin nay");
    }
  }

  async createVaccineImport(data) {
    try {
      // Chuyển đổi danh sách vaccine ID thành ObjectId
      const transformedData = {
        ...data,
        vaccines: data.vaccines.map((id) => new ObjectId(id)),
      };
      const vaccineImport = new VaccineImport(transformedData);
      await vaccineImport.validate();
      const result = await connectToDatabase.vaccineImports.insertOne(
        vaccineImport
      );
      return { _id: result.insertedId, ...transformedData };
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async updateVaccineImport(
    id,
    batchNumber,
    vaccines,
    price,
    importDate,
    importedBy,
    supplier,
    createAt
  ) {
    try {
      const result = await connectToDatabase.vaccineImports.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        {
          $set: batchNumber,
          vaccines,
          price,
          importDate,
          importedBy,
          supplier,
          createAt,
        },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteVaccineimport(id) {
    try {
      await connectToDatabase.vaccineImports.findOneAndDelete({
        _id: new ObjectId(id),
      });
      return "Xoa thanh cong";
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const vaccineImportService = new VaccineImportService();
export default vaccineImportService;
