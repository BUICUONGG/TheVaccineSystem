import { Router } from "express";
import {
  showChildController,
  createChildController,
  updateChildController,
  deleteChildController,
  getAllChildbyCusIController,
} from "../controllers/child.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const childRoutes = Router();

//PATH:vô đây lấy api nè
// mặc định:      http://localhost:8080/child/.......

childRoutes.get("/showChildren", validateAccessToken, showChildController);
childRoutes.post("/getAllChildbyCusId/:id", getAllChildbyCusIController);
childRoutes.post("/create", validateAccessToken, createChildController);
childRoutes.post("/update/:id", validateAccessToken, updateChildController);
childRoutes.post("deleteChild/:id", validateAccessToken, deleteChildController);
export default childRoutes;
