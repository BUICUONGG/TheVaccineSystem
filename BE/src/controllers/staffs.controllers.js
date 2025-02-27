import staffService from "../services/staff.services.js";

export const createStaffController = async (req, res) => {
  try {
    const data = req.body;
    const result = await staffService.createStaff(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateStaffController = async (req, res) => {};
export const deleteStaffController = async (req, res) => {};
export const getListStaffController = async (req, res) => {
  try {
    const result = await staffService.listStaff();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
