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
newsRoutes.get("/", getAllNewsController);
newsRoutes.get("/featured", getFeaturedNewsController);
newsRoutes.get("/search", searchNewsController);
newsRoutes.get("/category/:category", getNewsByCategoryController);
newsRoutes.get("/related/:id", getRelatedNewsController);
newsRoutes.get("/:id", getNewsByIdController);
newsRoutes.get("/:slug", getNewsByIdController);
newsRoutes.post("/view/:id", incrementViewCountController);

// Protected routes (authentication required)
newsRoutes.post("/create", validateAccessToken, isAdmin, createNewsController);
newsRoutes.put("/update/:id", validateAccessToken, isAdmin, updateNewsController);
newsRoutes.delete("/delete/:id", validateAccessToken, isAdmin, deleteNewsController);
newsRoutes.put("/archive/:id", validateAccessToken, isAdmin, archiveNewsController);
newsRoutes.put("/restore/:id", validateAccessToken, isAdmin, restoreNewsController);

export default newsRoutes;
