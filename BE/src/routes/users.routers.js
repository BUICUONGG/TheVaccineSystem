import { Router } from "express";
import {
  showInFoController,
  addUserController,
  loginController,
} from "../controllers/users.controllers.js";

const usersRouter = Router();

usersRouter.post("/login", loginController);
usersRouter.post("/register");
usersRouter.post("/logout");
usersRouter.post("/forgot-password");
usersRouter.get("/showData", showInFoController);
usersRouter.post("/addUser", addUserController);
export default usersRouter;
