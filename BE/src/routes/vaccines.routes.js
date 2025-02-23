import { Router } from "express";
import {
  addVaccineController,
  getVaccinesController,
  updateVaccineController,
  deleteVaccineController,
  // showInfoVaccineController,
  showVaccineAndImportController,
} from "../controllers/vaccines.controllers.js";

const vaccinesRoutes = Router();

vaccinesRoutes.get("/listVaccine", getVaccinesController);
vaccinesRoutes.post("/addVaccine", addVaccineController);
vaccinesRoutes.post("/updateVaccine/:id", updateVaccineController);
vaccinesRoutes.post("/delete/:id", deleteVaccineController);
vaccinesRoutes.get("/showInfo", showVaccineAndImportController);

export default vaccinesRoutes;
