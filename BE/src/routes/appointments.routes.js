import { Router } from "express";
import {
  createAptLeController,
  deleteAptLeController,
  listAllAptLeController,
  updateAptLeController,
} from "../controllers/appointment.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const aptLeRoutes = Router();
const aptGoiRoutes = Router();

//------------------Apt Lẻ -------------------------------------------
aptLeRoutes.get("/showInfo", validateAccessToken, listAllAptLeController);
aptLeRoutes.post("/create", validateAccessToken, createAptLeController);
aptLeRoutes.post("/update/:id", validateAccessToken, updateAptLeController);
aptLeRoutes.post("/delete/:id", validateAccessToken, deleteAptLeController);

//-----------------Apt Gois ------------------------------------------
// aptGoiRoutes.get("/showInfo", listAllAptGoiController);
// aptGoiRoutes.post("/create", createAptGoiController);
// aptGoiRoutes.post("/update/:id", updateAptGoiController);
// aptGoiRoutes.post("/delete/:id", deleteAptGoiController);

export { aptGoiRoutes, aptLeRoutes };
