import Router from "express";
import {
  callbackController,
  createpaymentController,
  orderStatusController,
} from "../controllers/payment.controllers.js";

const paymentRoutes = Router();

paymentRoutes.post("/payment", createpaymentController);
paymentRoutes.post("/callback", callbackController);
paymentRoutes.post("/order-status/:id", orderStatusController);

export default paymentRoutes;
