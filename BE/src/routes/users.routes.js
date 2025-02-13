import { Router } from "express";
import {
  showInFoController,
  registerController,
  loginController,
  deleteController,
  updateController,
  // getAllUsersController,
  // logoutController,
} from "../controllers/users.controllers.js";
import {
  registerValidate,
  loginValidate,
  // verifyToken,
  // verifyAdmin,
  // verifyStaff,
} from "../middlewares/user.middleware.js";

const usersRouter = Router();

usersRouter.get("/showInfo", showInFoController);
usersRouter.post("/login", loginValidate, loginController);
usersRouter.post("/register", registerValidate, registerController);
usersRouter.post("/delete/:id",  deleteController);
usersRouter.post("update/:id",  updateController);
// usersRouter.post("/logout", logoutController);
export default usersRouter;
