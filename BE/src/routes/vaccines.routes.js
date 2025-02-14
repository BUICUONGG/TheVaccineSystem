import { Router } from "express";
import {
  addVaccineController,
  getVaccinesController,
  updateVaccineController,
  deleteVaccineController,
} from "../controllers/vaccines.controllers.js";

const vaccinesRouter = Router();

vaccinesRouter.get("/listVaccine", getVaccinesController);
vaccinesRouter.post("/addVaccine",  addVaccineController);
vaccinesRouter.post("/updateVaccine", updateVaccineController);
vaccinesRouter.delete("/delete/:id",  deleteVaccineController);

export default vaccinesRouter;
