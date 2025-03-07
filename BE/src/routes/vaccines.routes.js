import { Router } from "express";
import {
  addVaccineController,
  getVaccinesController,
  updateVaccineController,
  deleteVaccineController,
  showVaccineAndImportController,
} from "../controllers/vaccines.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const vaccinesRoutes = Router();

//PATH:       http://localhost:8080/vaccine

vaccinesRoutes.get("/listVaccine", validateAccessToken, getVaccinesController);
vaccinesRoutes.post("/addVaccine", validateAccessToken, addVaccineController);
vaccinesRoutes.post(
  "/updateVaccine/:id",
  validateAccessToken,
  updateVaccineController
);
vaccinesRoutes.post(
  "/delete/:id",
  validateAccessToken,
  deleteVaccineController
);
vaccinesRoutes.get(
  "/showInfo",
  validateAccessToken,
  showVaccineAndImportController
);

export default vaccinesRoutes;
