import { ClientSession } from "mongodb";
import connectToDatabase from "../config/database.js";
import VaccineInventory from "../model/vaccine/vaccineInventorySchema.js";
import mongoose from "mongoose";

class VaccineService {
<<<<<<< HEAD
  async addVaccine(vaccineData) {
    const vaccine = new VaccineInventory(vaccineData);
    await vaccine.validate();
    await vaccine.save();
    return vaccine;
  }
}

const vaccinceService = new VaccineService();
export default vaccinceService;
=======
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
>>>>>>> 3654e8f213246ad6d227d96de6db58dfcfa03805
