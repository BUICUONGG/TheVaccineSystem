import { Router } from "express";
import {
  createStaffController,
  deleteStaffController,
  getListStaffController,
  updateStaffController,
} from "../controllers/staffs.controllers.js";

const staffRoutes = Router();

//PATH            http://localhost:8080/staff/................

staffRoutes.get("/getliststaff", getListStaffController);
staffRoutes.post("/createStaff", createStaffController);
staffRoutes.post("/updateStaff", updateStaffController);
staffRoutes.post("/deleteStaff", deleteStaffController);
export default staffRoutes;
