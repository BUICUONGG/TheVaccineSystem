import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";
import VaccineImport from "../model/vaccineImportSchema.js";
class VaccineImportService {
  async getFullData() {
    try {
      const result = await connectToDatabase.vaccineImports.find().toArray();
      if (!result) throw new Error("Danh sachs trống");
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getOneById(id) {
    try {
      const result = await connectToDatabase.vaccineImports.findOne({
        _id: new ObjectId(id),
      });
      if (!result) throw new Error(`Không lấy được ${id} này`);
      return result;
    } catch (error) {
      console.log(error.message);
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
      if (!result) throw new Error("Không tạo lô vaccine");
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
      if (!result) throw new Error(`Không cập nhật được lô vaccine ${id}`);
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async deleteVaccineimport(id) {
    try {
      const result = await connectToDatabase.vaccineImports.findOneAndDelete({
        _id: new ObjectId(id),
      });
      if (!result) throw new Error(`Không thể xoá id ${id} này`);
      return "Xoa thanh cong";
    } catch (error) {
      console.log(error.message);
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
      if (!result) throw new Error("Không thống kê được vaccine có trong lô");
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

const vaccineImportService = new VaccineImportService();
export default vaccineImportService;
