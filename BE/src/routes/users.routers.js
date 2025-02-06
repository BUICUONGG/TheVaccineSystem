import { Router } from "express";
import {
  showInFoController,
  addUserController,
} from "../controllers/users.controllers.js";

const usersRouter = Router();

usersRouter.post("/login");
usersRouter.post("/register");
usersRouter.post("/logout");
usersRouter.post("/forgot-password");
usersRouter.get("/showInfo", showInFoController);
usersRouter.post("/addUser", addUserController);
export default usersRouter;
