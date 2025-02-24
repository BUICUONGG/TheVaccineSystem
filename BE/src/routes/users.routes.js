import { Router } from "express";
import {
  showInFoController,
  registerController,
  loginController,
  deleteController,
  updateController,
  logoutController,
  refreshTokenController,
  checkUsernameController,
} from "../controllers/users.controllers.js";
import {
  registerValidate,
  loginValidate,
  validateAccessToken,
  // verifyAdmin,
  validateRefreshToken,
  // verifyStaff,
} from "../middlewares/user.middleware.js";

const usersRoutes = Router();

//PATH:             http://localhost:8080/user/.........

usersRoutes.get("/showInfo", validateAccessToken, showInFoController);

usersRoutes.post("/login", loginValidate, loginController);

usersRoutes.post("/register", registerValidate, registerController);

usersRoutes.post(
  "/delete/:id",
  validateAccessToken,
  // verifyAdmin,
  deleteController
);

usersRoutes.post(
  "/update/:id",
  updateController
);

usersRoutes.post("/logout/:id", validateAccessToken, logoutController);

usersRoutes.post(
  "/refresh-token",
  validateRefreshToken,
  refreshTokenController
);

usersRoutes.post("/check-username", checkUsernameController);

export default usersRoutes;
