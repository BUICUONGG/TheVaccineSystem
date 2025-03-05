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

vaccinesRoutes.get("/listVaccine", getVaccinesController);
vaccinesRoutes.post("/addVaccine", addVaccineController);
vaccinesRoutes.post("/updateVaccine/:id", updateVaccineController);
vaccinesRoutes.post("/delete/:id", deleteVaccineController);
vaccinesRoutes.get("/showInfo", showVaccineAndImportController);

export default vaccinesRoutes;
