import { Router } from "express";
import {
  showInFoController,
  registerController,
  loginController,
  deleteController,
  updateController,
} from "../controllers/users.controllers.js";
import {
  registerValidate,
  loginValidate,
  verifyToken,
  verifyAdmin,
  // verifyStaff,
} from "../middlewares/user.middleware.js";

const usersRouter = Router();

usersRouter.get("/showInfo", verifyToken, showInFoController);
usersRouter.post("/login", loginValidate, loginController);
usersRouter.post("/register", registerValidate, registerController);
usersRouter.post("/delete/:id", verifyToken, verifyAdmin, deleteController);
usersRouter.post("update/:id", verifyToken, verifyAdmin, updateController);

export default usersRouter;
