import Router from "express";
import {
  callbackController,
  createpaymentController,
  orderStatusController,
} from "../controllers/payment.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const paymentRoutes = Router();

paymentRoutes.post("/payment", validateAccessToken, createpaymentController);
paymentRoutes.post("/callback", callbackController);
paymentRoutes.post("/order-status/:id", orderStatusController);

export default paymentRoutes;
