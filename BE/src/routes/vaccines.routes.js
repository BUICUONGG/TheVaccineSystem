import { Router } from "express";
import {
  addVaccineController,
  getVaccinesController,
  updateVaccineController,
  deleteVaccineController,
} from "../controllers/vaccines.controllers.js";
import { verifyVaccineAdmin, validateVaccineData } from "../middlewares/vaccine.middleware.js";

const vaccinesRouter = Router();

// Public route - không cần verify token
vaccinesRouter.get("/listVaccine", getVaccinesController);

// Protected routes - cần verify admin
vaccinesRouter.post("/addVaccine", verifyVaccineAdmin, validateVaccineData, addVaccineController);
vaccinesRouter.post("/updateVaccine", verifyVaccineAdmin, validateVaccineData, updateVaccineController);
vaccinesRouter.delete("/delete/:id", verifyVaccineAdmin, deleteVaccineController);

export default vaccinesRouter;
