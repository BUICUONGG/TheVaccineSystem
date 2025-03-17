import { Router } from "express";
import {
    createNewsController,
    deleteNewsController,
    getAllNewsController,
    getNewsByIdController,
    getNewsByCategoryController,
    getFeaturedNewsController,
    updateNewsController,
    archiveNewsController,
    restoreNewsController,
    incrementViewCountController,
    getRelatedNewsController,
    searchNewsController
} from "../controllers/news.controllers.js";

import { validateAccessToken, isAdmin } from "../middlewares/user.middleware.js";

const newsRoutes = Router();
// PATH: http://localhost:8080/news/......

// Public routes (no authentication required)
newsRoutes.get("/getAllNews", getAllNewsController);
newsRoutes.get("/featured", getFeaturedNewsController);
newsRoutes.get("/search", searchNewsController);
newsRoutes.get("/category/:category", getNewsByCategoryController);
newsRoutes.get("/related/:id", getRelatedNewsController);
newsRoutes.get("/detail/:id", getNewsByIdController);
newsRoutes.get("/:id", getNewsByIdController);
newsRoutes.post("/view/:id", incrementViewCountController);

// Protected routes (authentication required)
newsRoutes.post("/create", validateAccessToken, isAdmin, createNewsController);
newsRoutes.post("/update/:id", validateAccessToken, isAdmin, updateNewsController);
newsRoutes.post("/delete/:id", validateAccessToken, isAdmin, deleteNewsController);
newsRoutes.post("/archive/:id", validateAccessToken, isAdmin, archiveNewsController);
newsRoutes.post("/restore/:id", validateAccessToken, isAdmin, restoreNewsController);

export default newsRoutes;
