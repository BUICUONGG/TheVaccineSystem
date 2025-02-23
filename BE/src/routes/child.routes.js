import { Router } from "express";
import {
  showChildController,
  createChildController,
  updateChildController,
  // updateChildController,
  // deleteChildController,
} from "../controllers/child.controllers.js";

const childRoutes = Router();

childRoutes.get("/showChildren", showChildController);
childRoutes.post("/create", createChildController);
childRoutes.post("/update/:id", updateChildController);
export default childRoutes;
