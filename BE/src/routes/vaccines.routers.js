import { Router } from "express";
import {
    addVaccineController,
    getAllVaccinesController,
    getVaccineByIdController,
    updateVaccineController,
    deleteVaccineController
} from "../controllers/vaccines.controllers.js";
import { verifyToken } from "../middleware/auth.js";
import { isAdmin } from "../middleware/authorization.js";

const vaccineRouter = Router();

// Chỉ admin mới có quyền CRUD vaccine
// vaccineRouter.post("/", verifyToken, isAdmin, addVaccineController);
vaccineRouter.post("/", addVaccineController);
vaccineRouter.get("/", getAllVaccinesController); 
vaccineRouter.get("/:id", getVaccineByIdController);
vaccineRouter.put("/:id", verifyToken, isAdmin, updateVaccineController);
vaccineRouter.delete("/:id", verifyToken, isAdmin, deleteVaccineController);

export default vaccineRouter;
