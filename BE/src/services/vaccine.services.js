import connectToDatabase from "../config/database.js";
import VaccineInventory from "../model/vaccineInventorySchema.js";
import { ObjectId } from "mongodb";
import "dotenv/config";

class VaccineService {
  async addVaccine(vaccineData) {
    try {
      const vaccine = new VaccineInventory(vaccineData);
      await vaccine.validate();
      const result = await connectToDatabase.vaccines.insertOne(vaccine);
      return { _id: result.insertedId, ...vaccineData };
    } catch (error) {
      console.error("Error adding vaccine:", error.message);
      throw new Error(error.message);
    }
  }

  async updateVaccine(vaccineData) {
    try {
      const { _id, ...updateData } = vaccineData;

      if (!_id) {
        throw new Error("Vaccine ID is required for update");
      }

      // Kiểm tra vaccine có tồn tại không
      const existingVaccine = await connectToDatabase.vaccines.findOne({
        _id: new ObjectId(_id),
      });

      if (!existingVaccine) {
        throw new Error("Vaccine not found");
      }

      // Cập nhật vaccine
      const result = await connectToDatabase.vaccines.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
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
      const existingVaccine = await connectToDatabase.vaccines.findOne({
        _id: new ObjectId(vaccineId),
      });

      if (!existingVaccine) {
        throw new Error("Vaccine not found");
      }

      const result = await connectToDatabase.vaccines.deleteOne({
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
      const vaccines = await connectToDatabase.vaccines.find().toArray();
      if (!vaccines || vaccines.length === 0) {
        throw new Error("No vaccines found");
      }
      return vaccines;
    } catch (error) {
      console.error("Error getting vaccines:", error.message);
      throw new Error(error.message);
    }
  }
}

const vaccineService = new VaccineService();
export default vaccineService;
