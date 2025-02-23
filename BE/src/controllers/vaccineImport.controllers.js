import vaccineImportService from "../services/vaccineImport.services.js";

export const getFullDataController = async (req, res) => {
  try {
    const result = await vaccineImportService.getFullData();
    res.status(200).json(result);
  } catch (error) {
    console.log("KHong co thong tin ");
    res.status(500).json(error.message);
  }
};

export const getOneByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await vaccineImportService.getOneById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const createVaccineImportController = async (req, res) => {
  try {
    const data = req.body;
    const result = await vaccineImportService.createVaccineImport(data);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateVaccineImportController = async (req, res) => {
  try {
    const {
      batchNumber,
      vaccines,
      price,
      importDate,
      importedBy,
      supplier,
      createAt,
    } = req.body;
    const id = req.params.id;
    const result = await vaccineImportService.updateVaccineImport(
      batchNumber,
      vaccines,
      price,
      importDate,
      importedBy,
      supplier,
      createAt
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const deleteVaccineimportController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await vaccineImportService.deleteVaccineimport(id);
    res.status(200).json(result);
  } catch (error) {
    throw new Error(error.message);
  }
};
