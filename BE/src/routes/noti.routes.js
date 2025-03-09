import { Router } from "express";
import {
  createNotiController,
  getNotiByCusIdController,
} from "../controllers/noti.controllers.js";

const notiRoutes = Router();

notiRoutes.get("/getNotiByCusId/:id", getNotiByCusIdController);
notiRoutes.post("/createNoti", createNotiController);

export default notiRoutes;
