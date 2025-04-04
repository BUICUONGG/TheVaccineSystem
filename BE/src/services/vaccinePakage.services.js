import connectToDatabase from "../config/database.js";
import VaccinePackage from "../model/vaccinePackageSchema.js";
import { ObjectId } from "mongodb";

class VaccinePakageService {
  async getAllVaccinePakage() {
    try {
      const result = await connectToDatabase.vaccinepackages.find().toArray();
      if (!result) throw new Error("Không có gói nào cả");
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async createVaccinePakage(data) {
    try {
      const pakage = new VaccinePackage(data);
      await pakage.validate();
      const result = await connectToDatabase.vaccinepackages.insertOne(pakage);
      if (!result) throw new Error("Không tạo được gói vaccine");
      return { _id: result.insertedId, ...data };
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async updateVaccinePakage(id, updateData) {
    try {
      const result = await connectToDatabase.vaccinepackages.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        { $set: updateData },
        { returnDocument: "after" }
      );
      if (!result)
        throw new Error(`Không thể update / không tìm thấy ${id} này`);
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async deleteVaccinePakage(id) {
    try {
      const result = await connectToDatabase.vaccinepackages.findOneAndDelete({
        _id: new ObjectId(id),
      });
      if (!result)
        throw new Error(`Không thể delete or không tìm thấy ${id} này`);
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getAllVaccinePackages() {
    try {
      // Lấy tất cả gói vaccine
      const packages = await connectToDatabase.vaccinepackages.find().toArray();

      // Lấy danh sách tất cả vaccineId có trong packages
      const vaccineIds = packages.flatMap((pkg) =>
        pkg.vaccines.map((v) => v.vaccineId)
      );

      // Tìm thông tin vaccine từ inventory dựa trên vaccineIds
      const inventoryData = await connectToDatabase.vaccinceInventorys
        .find({
          _id: { $in: vaccineIds },
        })
        .toArray();

      // Ghép thông tin vaccine vào từng package
      const result = packages.map((pkg) => ({
        ...pkg,
        vaccines: pkg.vaccines.map((vaccine) => ({
          ...vaccine,
          details:
            inventoryData.find((inv) => inv._id.equals(vaccine.vaccineId)) ||
            null,
        })),
      }));

      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getDetailFullVaccinePakageById() {
    try {
      // Lấy tất cả gói vaccine
      const packages = await connectToDatabase.vaccinepackages.find().toArray();

      // Lấy danh sách tất cả vaccineId có trong packages
      const vaccineIds = packages.flatMap((pkg) =>
        pkg.vaccines.map((v) => v.vaccineId)
      );

      // Tìm thông tin vaccine từ inventory dựa trên vaccineIds
      const inventoryData = await connectToDatabase.vaccinceInventorys
        .find({ _id: { $in: vaccineIds } })
        .toArray();

      // Ghép thông tin vaccine vào từng package
      const result = packages.map((pkg) => ({
        ...pkg,
        vaccines: pkg.vaccines.map((vaccine) => ({
          ...vaccine,
          details:
            inventoryData.find((inv) => inv._id.equals(vaccine.vaccineId)) ||
            null,
        })),
      }));

      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

const vaccinePakageService = new VaccinePakageService();
export default vaccinePakageService;
