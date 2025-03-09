import { Router } from "express";
import {
    createNewsController,
    deleteNewsController,
    showNewsController,
    updateNewsController,
} from "../controllers/news.controller";

import { validateAccessToken } from "../middlewares/user.middleware";
const newsRoutes = Router();
// PATH: http://localhost:8080/news/......

newsRoutes.post("/showNews", validateAccessToken, showNewsController);
newsRoutes.post("/createNews", validateAccessToken, createNewsController);
newsRoutes.post("/update/:id", validateAccessToken, updateNewsController);
newsRoutes.post("/delete/:id", validateAccessToken, deleteNewsController);

export default newsRoutes;
