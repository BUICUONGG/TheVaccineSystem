import vaccineService from "../services/vaccine.services.js";

export const addVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccineService.addVaccine(req.body);
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

export const updateVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccineService.updateVaccine(req.body);
    res.status(200).json({ message: "Vaccine updated successfully", vaccine });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};