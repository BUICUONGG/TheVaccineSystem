import appointmentService from "../services/appointment.services.js";

export const listAllAptLeController = async (req, res) => {
  try {
    const result = await appointmentService.listAptLe();
    if (!result) {
      throw new Error("khong the in danh sach");
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("loi o controller");
    res.status(500).json(error.message);
  }
};

export const createAptLeController = async (req, res) => {
  try {
    const data = req.body;
    const result = await appointmentService.createAptLe(data);
    if (!result) {
      throw new Error("Khong co thong tin");
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("loi controller");
    res.status(500).json(error.message);
  }
};

export const updateAptLeController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    const result = await appointmentService.updateAptLe(id, dataUpdate);
    if (!result) throw new Error("khong thee updates");
    res.status(200).json(result);
  } catch (error) {
    console.log(" ko the update ");
    res.status(500).json(error.message);
  }
};

export const deleteAptLeController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await appointmentService.deleteAptLe(id);
    if (!result) throw new Error("khong the deletee");
    res.status(200).json(result);
  } catch (error) {
    console.log(" ko the delete ");
    res.status(500).json(error.message);
  }
};

// ======================================================================================================

// export const listAllAptGoiController = async (req, res) => {};

// export const createAptGoiController = async (req, res) => {}
// export const updateAptGoiController = async (req, res) => {};
// export const deleteAptGoiController = async (req, res) => {};
