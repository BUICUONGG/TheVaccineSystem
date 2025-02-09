import mongoose from "mongoose";
import connectToDatabase from "../config/database.js";
import VaccineInventory from "../model/vaccine/vaccineInventorySchema.js";

class VaccineService {
  async addVaccine(vaccineData) {
    const vaccine = new VaccineInventory(vaccineData);
    await vaccine.validate();
    await vaccine.save();
    return vaccine;
  }
}

const vaccinceService = new VaccineService();
export default vaccinceService;
