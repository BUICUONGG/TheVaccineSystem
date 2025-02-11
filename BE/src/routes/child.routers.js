import { Router } from "express";
import {
    showChildController,
    createChildController
    // updateChildController,
    // deleteChildController,
} from "../controllers/child.controllers.js";

const childRouter = Router();

childRouter.get("/show", showChildController);
childRouter.post("/create", createChildController);

export default childRouter;

