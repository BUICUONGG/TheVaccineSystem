import Router from "express";
import {
  createVaccineImportController,
  deleteVaccineimportController,
  getFullDataController,
  getOneByIdController,
  updateVaccineImportController,
} from "../controllers/vaccineImport.controllers.js";

const vaccineImportRoutes = Router();

// lấy hết thông tin trong lô db
vaccineImportRoutes.get("/getfullData", getFullDataController);

//lấy thông tin chi tiết của 1 lô
vaccineImportRoutes.get("/getOneById/:id", getOneByIdController);

//tạo 1 lô vaccine
vaccineImportRoutes.post(
  "/createvaccinceimport",
  createVaccineImportController
);

//cập nhật 1 lô vaccine theo id
vaccineImportRoutes.post(
  "/updatevaccineImport/:id",
  updateVaccineImportController
);

// xoá 1 lô vaccine theo id
vaccineImportRoutes.post(
  "/deletevaccineimport/:id",
  deleteVaccineimportController
);

export default vaccineImportRoutes;
