import { Router } from "express";
import { 
    addVaccineController
} from "../controllers/vaccines.controllers.js"

const vaccinesRouter = Router();

vaccinesRouter.post("/addVaccine", addVaccineController);


export default vaccinesRouter;