import { Router } from "express";

export const addVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccineService.addVaccine(req.body);
    res.status(201).json({ message: "Vaccine added successfully", vaccine });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default vaccinceRouter;