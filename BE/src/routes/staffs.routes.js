import { Router } from "express";
import {
  createStaffController,
  deleteStaffController,
  getListStaffController,
  updateStaffController,
} from "../controllers/staffs.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const staffRoutes = Router();

//PATH            http://localhost:8080/staff/................

staffRoutes.get("/getliststaff", validateAccessToken, getListStaffController);
staffRoutes.post("/createStaff", validateAccessToken, createStaffController);
staffRoutes.post("/updateStaff", validateAccessToken, updateStaffController);
staffRoutes.post("/deleteStaff", validateAccessToken, deleteStaffController);
export default staffRoutes;
