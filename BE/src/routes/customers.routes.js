import { Router } from "express";
import {
  getAllCusController,
  getOneCusController,
  updatemeController,
} from "../controllers/customer.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const customerRoutes = Router();

customerRoutes.get(
  "/getOneCustomer/:id",
  validateAccessToken,
  getOneCusController
);
customerRoutes.get("/getAllCustomer", validateAccessToken, getAllCusController);

customerRoutes.post("/update/:id", validateAccessToken, updatemeController);

export default customerRoutes;
