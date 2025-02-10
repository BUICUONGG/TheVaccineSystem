import { Router } from "express";
import { addVaccineController } from "../controllers/vaccines.controllers.js";

const vaccinesRouter = express.Router();

vaccinesRouter.post("/addVaccine", addVaccineController);
vaccinesRouter.get("/ListVaccine", getVaccinesController);

export default vaccinesRouter;
