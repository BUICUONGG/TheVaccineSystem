import Router from "express";
import {
  createVaccinePakageController,
  deleteVaccinePakageController,
  getAllVaccinePakageController,
  updateVaccinePakageController,
} from "../controllers/vaccinePakage.controllers.js";

const vaccinePakageRoutes = Router();

// PATH                    http://localhost:8080/vaccinepakage................

vaccinePakageRoutes.get("/showVaccinePakage", getAllVaccinePakageController);

vaccinePakageRoutes.post("/createVaccinePakage", createVaccinePakageController);

vaccinePakageRoutes.post(
  "/updateVaccinePakage/:id",
  updateVaccinePakageController
);

vaccinePakageRoutes.post(
  "/deleteVaccinePakage/:id",
  deleteVaccinePakageController
);

export default vaccinePakageRoutes;
