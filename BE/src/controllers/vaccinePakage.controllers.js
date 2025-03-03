import vaccinePakageService from "../services/vaccinePakage.services.js";

export const getAllVaccinePakageController = async (req, res) => {
  try {
    const result = await vaccinePakageService.getAllVaccinePakage();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const createVaccinePakageController = async (req, res) => {
  try {
    const data = req.body;
    const result = await vaccinePakageService.createVaccinePakage(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
export const updateVaccinePakageController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await vaccinePakageService.updateVaccinePakage(id, data);
    res.status(200).json("Cập nhật thành công", result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
export const deleteVaccinePakageController = async (req, res) => {
  try {
    const id = req.params.id;
    await vaccinePakageService.deleteVaccinePakage(id);
    res.status(200).json("Delete thành công");
  } catch (error) {
    throw new Error(error.message);
  }
};
