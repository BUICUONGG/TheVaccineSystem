import { Router } from "express";
import {
  showInFoController,
  registerController,
  loginController,
  deleteController,
  // updateController,
  logoutController,
  refreshTokenController,
  // logoutController,
} from "../controllers/users.controllers.js";
import {
  registerValidate,
  loginValidate,
  // validateAccessToken,
  // verifyAdmin,
  validateRefreshToken,
  // verifyStaff,
} from "../middlewares/user.middleware.js";

const usersRouter = Router();

usersRouter.get("/showInfo",  showInFoController);

usersRouter.post("/login", loginValidate, loginController);

usersRouter.post("/register", registerValidate, registerController);

usersRouter.post(
  "/delete/:id",
  // validateAccessToken,
  // verifyAdmin,
  deleteController
);

// usersRouter.post(
//   "/update/:id",
//   validateRefreshToken,
//   verifyAdmin,
//   updateController
// );

usersRouter.post("/logout/:id", logoutController);

usersRouter.post(
  "/refresh-token",
  validateRefreshToken,
  refreshTokenController
);
export default usersRouter;
