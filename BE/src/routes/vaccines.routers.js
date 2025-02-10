import express from 'express';
import { addVaccineController, getVaccinesController } from '../controllers/vaccines.controllers.js';

const vaccinesRouter = express.Router();

vaccinesRouter.post("/addVaccine", addVaccineController);
vaccinesRouter.get("/ListVaccine", getVaccinesController);

export default vaccinesRouter;
