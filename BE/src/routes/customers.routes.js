import { Router } from "express";
import {
  getAllCusController,
  getAptleAndAptGoiByCusIdController,
  getOneCusController,
  updatemeController,
} from "../controllers/customer.controllers.js";
import {
  validateAccessToken,
  validateRefreshToken,
} from "../middlewares/user.middleware.js";
import { refreshTokenController } from "../controllers/users.controllers.js";

const customerRoutes = Router();

//PATH:            http://localhost:8080/customer/........

customerRoutes.get(
  "/getOneCustomer/:id",
  validateAccessToken,
  getOneCusController
);

customerRoutes.get("/getAllCustomer", validateAccessToken, getAllCusController);

customerRoutes.post("/update/:id", validateAccessToken, updatemeController);

customerRoutes.post(
  "/refresh-token",
  validateRefreshToken,
  refreshTokenController
);

customerRoutes.post(
  "/getAptleAndAptGoiByCusId/:id",
  validateAccessToken,
  getAptleAndAptGoiByCusIdController
);
export default customerRoutes;
