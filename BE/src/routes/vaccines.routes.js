import { Router } from "express";
import {
  addVaccineController,
  getVaccinesController,
  updateVaccineController,
  deleteVaccineController,
} from "../controllers/vaccines.controllers.js";

const vaccinesRouter = Router();

vaccinesRouter.post("/addVaccine", addVaccineController);
vaccinesRouter.get("/listVaccine", getVaccinesController);
vaccinesRouter.post("/updateVaccine", updateVaccineController);
vaccinesRouter.post("/deleteVaccine", deleteVaccineController);

export default vaccinesRouter;
