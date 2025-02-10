import { ClientSession } from "mongodb";
import vaccinceService from "../services/vaccine.services.js";

export const addVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccinceService.addVaccine(req.body);
    res.status(201).json({ message: "Vaccine added successfully", vaccine });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getVaccinesController = async (req, res) => {
  try {
    const vaccines = await vaccineService.getVaccines();
    return res.json({ vaccines });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


