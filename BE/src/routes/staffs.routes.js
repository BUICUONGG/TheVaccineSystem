import { Router } from "express";
import {
  createStaffController,
  deleteStaffController,
  getListStaffController,
  updateStaffController,
} from "../controllers/staffs.controllers.js";

const staffRoutes = Router();

staffRoutes.get("/getliststaff", getListStaffController);
staffRoutes.post("createStaff", createStaffController);
staffRoutes.post("/updateStaff", updateStaffController),
  staffRoutes.post("/deleteStaff", deleteStaffController);
export default staffRoutes;
