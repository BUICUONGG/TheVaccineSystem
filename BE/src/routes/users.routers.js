import { Router } from "express";
import {
  showInFoController,
  addUserController,
  loginController,
} from "../controllers/users.controllers.js";

const usersRouter = Router();

usersRouter.get("/showInfo", showInFoController);
usersRouter.post("/login", loginController);
usersRouter.post("/addUser", addUserController);

export default usersRouter;
