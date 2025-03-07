import { Router } from "express";
import {
  showBlogsController,
  createBlogController,
  incrementViewsController,
  toggleLikeController,
  updateBlogController,
  deleteBlogController,
} from "../controllers/blog.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const blogRoutes = Router();

//PATH:          http://localhost:8080/blog/......

blogRoutes.get("/showBlog", validateAccessToken, showBlogsController);
blogRoutes.post("/createBlog", validateAccessToken, createBlogController);
blogRoutes.put(
  "/incrementViews/:blogId",
  validateAccessToken,
  incrementViewsController
);
blogRoutes.put("/like/:blogId", validateAccessToken, toggleLikeController);
blogRoutes.post("/update/:id", validateAccessToken, updateBlogController);
blogRoutes.post("/delete/:id", validateAccessToken, deleteBlogController);
export default blogRoutes;
