import { Router } from "express";
import {
  showChildController,
  createChildController,
  updateChildController,
  deleteChildController,
} from "../controllers/child.controllers.js";

const childRoutes = Router();

//PATH:vô đây lấy api nè
// mặc định:      http://localhost:8080/child/.......

childRoutes.get("/showChildren", showChildController);
childRoutes.post("/create", createChildController);
childRoutes.post("/update/:id", updateChildController);
childRoutes.post("deleteChild/:id", deleteChildController);
export default childRoutes;
