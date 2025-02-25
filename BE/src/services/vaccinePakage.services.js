import connectToDatabase from "../config/database.js";
import VaccinePackage from "../model/vaccinePackageSchema.js";
import { ObjectId } from "mongodb";

class VaccinePakageService {
  async getAllVaccinePakage() {
    try {
      return await connectToDatabase.vaccinepackages.find().toArray();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createVaccinePakage(data) {
    try {
      const pakage = new VaccinePackage(data);
      await pakage.validate();
      const result = await connectToDatabase.vaccinepackages.insertOne(pakage);
      return { _id: result.insertedId, ...data };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const vaccinePakageService = new VaccinePakageService();
export default vaccinePakageService;
