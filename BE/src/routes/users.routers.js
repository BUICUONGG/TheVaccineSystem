import { Router } from "express";
import {
  showInFoController,
  registerController,
  loginController,
  deleteController,
} from "../controllers/users.controllers.js";
import {
  registerValidate,
  loginValidate,
  verifyToken,
  verifyAdmin,
  verifyStaff,
} from "../middlewares/user.middleware.js";

const usersRouter = Router();

usersRouter.get("/showInfo", verifyToken, showInFoController);
usersRouter.post("/login", loginValidate, loginController);
usersRouter.post("/register", registerValidate, registerController);
usersRouter.delete("/delete/:id", verifyToken, verifyAdmin, deleteController);
export default usersRouter;
