import connectToDatabase from "../config/database.js";
import VaccineInventory from "../model/vaccineInventorySchema.js";
import { ObjectId } from "mongodb";
import "dotenv/config";

class VaccineService {
  async addVaccine(vaccineData) {
    try {
      const vaccine = new VaccineInventory(vaccineData);
      await vaccine.validate();
      const result = await connectToDatabase.vaccinceInventorys.insertOne(
        vaccine
      );
      if (!result) throw new Error("Không tạo được vaccine Inventory");
      return { _id: result.insertedId, ...vaccineData };
    } catch (error) {
      console.error("Error adding vaccine:", error.message);
      throw new Error(error.message);
    }
  }

  async updateVaccine(id, vaccineData) {
    try {
      // Kiểm tra vaccine có tồn tại không
      // Cập nhật vaccine
      const result =
        await connectToDatabase.vaccinceInventorys.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: vaccineData }
        );

      if (result.modifiedCount === 0) {
        throw new Error("No changes were made");
      }

      return { _id, ...updateData };
    } catch (error) {
      console.error("Error updating vaccine:", error.message);
      throw new Error(error.message);
    }
  }

  async deleteVaccine(vaccineId) {
    try {
      if (!vaccineId) {
        throw new Error("Vaccine ID is required for deletion");
      }

      // Kiểm tra vaccine có tồn tại không
      const existingVaccine =
        await connectToDatabase.vaccinceInventorys.findOne({
          _id: new ObjectId(vaccineId),
        });

      if (!existingVaccine) {
        throw new Error("Vaccine not found");
      }

      const result = await connectToDatabase.vaccinceInventorys.deleteOne({
        _id: new ObjectId(vaccineId),
      });

      if (result.deletedCount === 0) {
        throw new Error("Failed to delete vaccine");
      }

      return { message: "Vaccine deleted successfully", _id: vaccineId };
    } catch (error) {
      console.error("Error deleting vaccine:", error.message);
      throw new Error(error.message);
    }
  }

  async getVaccines() {
    try {
      const vaccines = await connectToDatabase.vaccinceInventorys
        .find()
        .toArray();
      if (!vaccines || vaccines.length === 0) {
        throw new Error("No vaccines found");
      }
      return vaccines;
    } catch (error) {
      console.error("Error getting vaccines:", error.message);
      throw new Error(error.message);
    }
  }

  async getVaccineWithImportsDetail() {
    try {
      // Lấy danh sách tất cả vaccine
      const vaccines = await connectToDatabase.vaccinceInventorys
        .find()
        .toArray();

      for (let vaccine of vaccines) {
        try {
          let vaccineId = vaccine._id;
          let vaccineImports = await connectToDatabase.vaccineImports
            .find({ "vaccines.vaccineId": vaccineId })
            .toArray();
          vaccine.vaccineImports = vaccineImports.map(
            ({ vaccines, ...rest }) => rest
          );
        } catch (error) {
          throw new Error(error.message);
        }
      }
      if (!vaccines) throw new Error("Không thể xem được chi tiếts");
      return vaccines;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vaccine:", error);
      throw new Error(error.message);
    }
  }
}
const vaccineService = new VaccineService();
export default vaccineService;
