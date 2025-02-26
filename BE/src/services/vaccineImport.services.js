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
      // const transformedData = {
      //   ...data,
      //   vaccines: data.vaccines.map((id) => new ObjectId(id)),
      // };
      const vaccineImport = new VaccineImport(data);
      await vaccineImport.validate();
      const result = await connectToDatabase.vaccineImports.insertOne(
        vaccineImport
      );
      return { _id: result.insertedId, ...data };
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

  //đếm số lượng vaccine có trong tất cả các lô
  async countVaccineIdWithDetails() {
    try {
      // Lấy danh sách vaccine từ VaccineImports và tính tổng quantity
      const vaccineImports = await connectToDatabase.vaccineImports
        .find()
        .toArray();
      const totalByVaccineId = vaccineImports.reduce((acc, importItem) => {
        importItem.vaccines.forEach(({ vaccineId, quantity }) => {
          acc[vaccineId] = (acc[vaccineId] || 0) + quantity;
        });
        return acc;
      }, {});

      // Lấy thông tin từ VaccineInventory
      const vaccineIds = Object.keys(totalByVaccineId).map(
        (id) => new ObjectId(id)
      );
      const vaccineDetails = await connectToDatabase.vaccinceInventorys
        .find({
          _id: { $in: vaccineIds },
        })
        .toArray();

      // Gộp dữ liệu từ VaccineImports và VaccineInventory
      const result = vaccineDetails.map((vaccine) => ({
        _id: vaccine._id,
        totalQuantity: totalByVaccineId[vaccine._id.toString()] || 0,
        vaccineName: vaccine.vaccineName,
        // description: vaccine.description,
        // manufacturer: vaccine.manufacturer,
        // createdAt: vaccine.createdAt,
        // imageUrl: vaccine.imageUrl,
        // information: vaccine.information,
      }));

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const vaccineImportService = new VaccineImportService();
export default vaccineImportService;
