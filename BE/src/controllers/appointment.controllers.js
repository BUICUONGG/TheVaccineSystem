import appointmentService from "../services/appointment.services.js";

export const listAllAptLeController = async (req, res) => {
  try {
    const result = await appointmentService.listAptLe();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const createAptLeController = async (req, res) => {
  try {
    const data = req.body;
    const result = await appointmentService.createAptLe(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateAptLeController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    const result = await appointmentService.updateAptLe(id, dataUpdate);
    res.status(200).json(result);
  } catch (error) {
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

export const getAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentService.listAptLe();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAppointmentsWithDetailsByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await appointmentService.getAppointmentsWithDetailsById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const searchAppointmentsController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await appointmentService.searchAppointments(id);
    res.status(200).json(result);
  } catch (error) {
    console.log("Khong tim hay hoa don nay");
    res.status(500).json(error.message);
  }
};

// ======================================================================================================

export const listAllAptGoiController = async (req, res) => {
  try {
    const result = await appointmentService.listAptGoi();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const showDetailAptGoiController = async (req, res) => {
  try {
    const result = await appointmentService.showDetailAptGoi();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const createAptGoiController = async (req, res) => {
  try {
    const data = req.body;
    const result = await appointmentService.createAptGoi(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateAptGoiController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    const result = await appointmentService.updateAptGoi(id, dataUpdate);
    if (!result) throw new Error("khong thee updates");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
export const deleteAptGoiController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await appointmentService.deleteGoi(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateDoseController = async (req, res) => {
  try {
    const id = req.params.id;
    const { doseNumber, status } = req.body;

    if (!doseNumber || !status) {
      return res
        .status(400)
        .json({ message: "Dose number and status are required" });
    }

    if (!["pending", "completed"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be either 'pending' or 'completed'" });
    }

    const result = await appointmentService.updateDose(id, doseNumber, status);
    if (!result) throw new Error("Cannot update dose");

    res.status(200).json(result);
  } catch (error) {
    console.log("Error updating dose:", error);
    res.status(500).json({ message: error.message });
  }
};

export const searchAptGoiByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await appointmentService.searchAptGoiById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
