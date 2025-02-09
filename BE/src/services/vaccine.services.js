import mongoose from "mongoose";
import connectToDatabase from "../config/database.js";
import VaccineInventory from "../model/vaccine/vaccineInventorySchema.js";

class VaccineService {
  async addVaccine(vaccineData) {
    try {
      const vaccine = new VaccineInventory(vaccineData);
      await vaccine.save();
      return vaccine;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllVaccines() {
    try {
      const vaccines = await VaccineInventory.find()
        .populate('typeId', 'name') // Populate type information
        .sort({ createdAt: -1 });
      return vaccines;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getVaccineById(id) {
    try {
      const vaccine = await VaccineInventory.findById(id)
        .populate('typeId', 'name');
      return vaccine;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateVaccine(id, updateData) {
    try {
      const vaccine = await VaccineInventory.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
      return vaccine;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteVaccine(id) {
    try {
      const vaccine = await VaccineInventory.findByIdAndDelete(id);
      return vaccine;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default VaccineService;

