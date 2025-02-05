import { Router } from "express";
import { showInFoController } from "../controllers/users.controllers.js";

const usersRouter = Router();

usersRouter.post("/login");
usersRouter.post("/register");
usersRouter.post("/logout");
usersRouter.post("/forgot-password");
usersRouter.get("/showInfo", showInFoController);

export default usersRouter;
