import { Router } from "express";
import { addVaccineController, getVaccinesController, updateVaccineController, deleteVaccineController } from "../controllers/vaccines.controllers.js";

const vaccinesRouter = Router();

vaccinesRouter.post("/addVaccine", addVaccineController);
vaccinesRouter.get("/ListVaccine", getVaccinesController);
vaccinesRouter.post("/UpdateVaccine", updateVaccineController);
vaccinesRouter.post("/DeleteVaccine", deleteVaccineController);

export default vaccinesRouter;
