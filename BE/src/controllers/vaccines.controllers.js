import vaccineService from "../services/vaccine.services.js";

export const addVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccineService.addVaccine(req.body);
    res.status(201).json({
      message: "Vaccine added successfully",
      vaccine: vaccine,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getVaccinesController = async (req, res) => {
  try {
    const vaccines = await vaccineService.getVaccines();
    return res.status(200).json({
      success: true,
      result: vaccines,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccineService.updateVaccine(req.body);
    res.status(200).json("Vaccine updated successfully", vaccine);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

export const deleteVaccineController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await vaccineService.deleteVaccine(id);
    res.status(200).json({
      success: true,
      result: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const showInfoVaccineController = async (req, res) => {
  try {
    const vaccines = await vaccineService.getAllVaccineImports();
    return res.status(200).json(vaccines);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
