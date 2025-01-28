import { Router } from "express";

const usersRouter = Router();

usersRouter.post("./login");
usersRouter.post("./register");
usersRouter.post("./logout");
usersRouter.post("./forgot-password");

export default usersRouter;
