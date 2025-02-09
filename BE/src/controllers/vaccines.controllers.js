<<<<<<< HEAD
import vaccinceService from "../services/vaccine.services.js";
=======
import { ClientSession } from "mongodb";
import vaccineService from "../services/vaccine.services.js";
>>>>>>> 3654e8f213246ad6d227d96de6db58dfcfa03805

export const addVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccinceService.addVaccine(req.body);
    res.status(201).json({ message: "Vaccine added successfully", vaccine });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
