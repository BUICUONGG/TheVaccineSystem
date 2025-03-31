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

export const getListStaffController = async (req, res) => {
  try {
    const result = await staffService.listStaff();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateStaffController = async (req, res) => {
  try {
    const { staffId } = req.body;
    const dataUpdate = req.body;
    const result = await staffService.updateStaff(staffId, dataUpdate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateStaffController:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteStaffController = async (req, res) => {
  try {
    const { staffId } = req.body;
    const result = await staffService.deleteStaff(staffId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteStaffController:", error);
    res.status(500).json({ message: error.message });
  }
};
