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
      {
        // const existingBatch = await connectToDatabase.vaccineImports.findOne({
        //   batchNumber,
        // });
        // if (existingBatch) {
        //   throw new Error("batchNumber is exists");
        // }
        // await newData.validate();
        const result = await connectToDatabase.vaccineImports.insertOne(data);
        return { _id: result.insertedId, ...data };
      }
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
