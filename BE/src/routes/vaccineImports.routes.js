import Router from "express";
import {
  countVaccineIdController,
  createVaccineImportController,
  deleteVaccineimportController,
  getFullDataController,
  getOneByIdController,
  updateVaccineImportController,
} from "../controllers/vaccineImport.controllers.js";

const vaccineImportRoutes = Router();

//PATH:             http://localhost:8080/vaccineimport/.........

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

vaccineImportRoutes.get("/getCountVaccineId", countVaccineIdController);
export default vaccineImportRoutes;
