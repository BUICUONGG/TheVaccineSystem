import mongoose from "mongoose";
import connectToDatabase from "../config/database.js";
import VaccineInventory from "../model/vaccineInventorySchema.js";
import "dotenv/config";

class VaccineService {
    async addVaccine(vaccineData) {
        try {
            const vaccine = new VaccineInventory(vaccineData);
            await vaccine.validate();
            const result = await connectToDatabase.vaccines.insertOne(vaccine);
            return result;

        } catch (error) {
            console.error("Error adding vaccine:", error.message);
            throw new Error(error.message);
        }
    }

    async getVaccines() {
        try {
            const vaccines = await VaccineInventory.find();
            return vaccines;
        } catch (error) {
            console.error("Error fetching vaccines:", error.message);
            throw new Error(error.message);
        }
    }
}

const vaccineService = new VaccineService();
export default vaccineService;
