import { Router } from "express";
import {
  showInFoController,
  registerController,
  loginController,
  deleteController,
  // updateController,
  logoutController,
  refreshTokenController,
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

usersRoutes.get("/showInfo", validateAccessToken, showInFoController);

usersRoutes.post("/login", loginValidate, loginController);

usersRoutes.post("/register", registerValidate, registerController);

usersRoutes.post(
  "/delete/:id",
  validateAccessToken,
  // verifyAdmin,
  deleteController
);

// usersRouter.post(
//   "/update/:id",
//   validateRefreshToken,
//   verifyAdmin,
//   updateController
// );

usersRoutes.post("/logout/:id", validateAccessToken, logoutController);

usersRoutes.post(
  "/refresh-token",
  validateRefreshToken,
  refreshTokenController
);
export default usersRoutes;
