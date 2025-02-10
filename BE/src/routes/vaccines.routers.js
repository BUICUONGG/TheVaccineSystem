import { Router } from "express";
import { addVaccineController, getVaccinesController } from "../controllers/vaccines.controllers.js";

const vaccinesRouter = Router();

vaccinesRouter.post("/addVaccine", addVaccineController);
vaccinesRouter.get("/ListVaccine", getVaccinesController);

export default vaccinesRouter;
