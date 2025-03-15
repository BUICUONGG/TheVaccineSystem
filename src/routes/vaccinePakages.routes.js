import Router from "express";
import {
  createVaccinePakageController,
  deleteVaccinePakageController,
  getAllVaccinePakageController,
  updateVaccinePakageController,
} from "../controllers/vaccinePakage.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const vaccinePakageRoutes = Router();

// PATH                    http://localhost:8080/vaccinepakage................

vaccinePakageRoutes.get(
  "/showVaccinePakage",
  validateAccessToken,
  getAllVaccinePakageController
);

vaccinePakageRoutes.post(
  "/createVaccinePakage",
  validateAccessToken,
  createVaccinePakageController
);

vaccinePakageRoutes.post(
  "/updateVaccinePakage/:id",
  validateAccessToken,
  updateVaccinePakageController
);

vaccinePakageRoutes.post(
  "/deleteVaccinePakage/:id",
  validateAccessToken,
  deleteVaccinePakageController
);

export default vaccinePakageRoutes;
