import { Router } from "express";
import {
  showInFoController,
  registerController,
  loginController,
  deleteController,
} from "../controllers/users.controllers.js";
import { validateRegister } from "../middlewares/user.middleware.js";

const usersRouter = Router();

usersRouter.get("/showInfo", showInFoController);
usersRouter.post("/login", loginController);
usersRouter.post("/register", validateRegister, registerController);
usersRouter.delete("/delete", deleteController);
export default usersRouter;
