import { Router } from "express";
import {
    createNewsController,
    deleteNewsController,
    showNewsController,
    updateNewsController,
    restoreNewsController,
} from "../controllers/news.controllers.js";

import { validateAccessToken } from "../middlewares/user.middleware.js";

const newsRoutes = Router();
// PATH: http://localhost:8080/news/......

newsRoutes.post("/showNews", validateAccessToken, showNewsController);
newsRoutes.post("/createNews", validateAccessToken, createNewsController);
newsRoutes.post("/update/:id", validateAccessToken, updateNewsController);
newsRoutes.post("/delete/:id", validateAccessToken, deleteNewsController);
newsRoutes.post("/restore/:id", validateAccessToken, restoreNewsController);

export default newsRoutes;
