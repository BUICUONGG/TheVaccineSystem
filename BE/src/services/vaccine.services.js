import { ClientSession } from "mongodb";
import connectToDatabase from "../config/database.js";

import mongoose from "mongoose";
import VaccineInventory from "../model/vaccineInventorySchema.js";

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
}

const vaccineService = new VaccineService();
export default vaccineService;
