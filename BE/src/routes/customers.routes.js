import { Router } from "express";
import {
  getAllCusController,
  getOneCusController,
  updatemeController,
} from "../controllers/customer.controllers.js";
import {
  validateAccessToken,
  validateRefreshToken,
} from "../middlewares/user.middleware.js";
import { refreshTokenController } from "../controllers/users.controllers.js";

const customerRoutes = Router();

customerRoutes.get(
  "/getOneCustomer/:id",
  validateAccessToken,
  getOneCusController
);

customerRoutes.get("/getAllCustomer", validateAccessToken, getAllCusController);

customerRoutes.post("/update/:id",validateAccessToken,  updatemeController);

customerRoutes.post(
  "/refresh-token",
  validateRefreshToken,
  refreshTokenController
);
export default customerRoutes;
