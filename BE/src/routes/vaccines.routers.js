import { Router } from "express";
import { addVaccineController, getVaccinesController, updateVaccineController } from "../controllers/vaccines.controllers.js";

const vaccinesRouter = Router();

vaccinesRouter.post("/addVaccine", addVaccineController);
vaccinesRouter.get("/ListVaccine", getVaccinesController);
vaccinesRouter.post("/UpdateVaccine", updateVaccineController);

export default vaccinesRouter;
