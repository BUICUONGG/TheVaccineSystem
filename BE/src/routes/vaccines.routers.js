import { Router } from "express";
import { addVaccineController } from "../controllers/vaccines.controllers.js";

const vaccinceRouter = Router();

vaccinceRouter.post("/addVaccine", addVaccineController);
export default vaccinceRouter;
