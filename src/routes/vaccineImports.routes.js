import Router from "express";
import {
  countVaccineIdController,
  createVaccineImportController,
  deleteVaccineimportController,
  getFullDataController,
  getOneByIdController,
  updateVaccineImportController,
} from "../controllers/vaccineImport.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const vaccineImportRoutes = Router();

//PATH:             http://localhost:8080/vaccineimport/.........

// lấy hết thông tin trong lô db
vaccineImportRoutes.get(
  "/getfullData",
  validateAccessToken,
  getFullDataController
);

//lấy thông tin chi tiết của 1 lô
vaccineImportRoutes.get(
  "/getOneById/:id",
  validateAccessToken,
  getOneByIdController
);

//tạo 1 lô vaccine
vaccineImportRoutes.post(
  "/createvaccinceimport",
  validateAccessToken,
  createVaccineImportController
);

//cập nhật 1 lô vaccine theo id
vaccineImportRoutes.post(
  "/updatevaccineImport/:id",
  validateAccessToken,
  updateVaccineImportController
);

// xoá 1 lô vaccine theo id
vaccineImportRoutes.post(
  "/deletevaccineimport/:id",
  validateAccessToken,
  deleteVaccineimportController
);

vaccineImportRoutes.get(
  "/getCountVaccineId",
  validateAccessToken,
  countVaccineIdController
);
export default vaccineImportRoutes;
