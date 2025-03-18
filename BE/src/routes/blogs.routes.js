import { Router } from "express";
import {
  showBlogsController,
  createBlogController,
  getBlogByIdController,
  getBlogByCategoryController,
  updateBlogController,
  deleteBlogController,
  restoreBlogController,
  incrementViewsController,
  toggleLikeController,
  rateBlogController,
  getRelatedBlogsController,
  getPopularTagsController,
  addCommentController,
  hideCommentController,
  showCommentController
} from "../controllers/blog.controllers.js";
import { validateAccessToken, isAdmin } from "../middlewares/user.middleware.js";

const blogRoutes = Router();

//PATH: http://localhost:8080/blog/......

// Public routes (no authentication required)
blogRoutes.get("/showBlog", showBlogsController);
blogRoutes.get("/tags/popular", getPopularTagsController);
blogRoutes.get("/category/:category", getBlogByCategoryController);
blogRoutes.get("/related/:blogId", getRelatedBlogsController);
blogRoutes.get("/detail/:id", getBlogByIdController);
blogRoutes.post("/view/:blogId", incrementViewsController);

// Protected routes (authentication required)
blogRoutes.post("/create", validateAccessToken, createBlogController);
blogRoutes.post("/update/:id", validateAccessToken, updateBlogController);
blogRoutes.post("/delete/:id", validateAccessToken, deleteBlogController);
blogRoutes.post("/restore/:id", validateAccessToken, restoreBlogController);
blogRoutes.post("/like/:blogId", validateAccessToken, toggleLikeController);
blogRoutes.post("/rate/:blogId", validateAccessToken, rateBlogController);

// Comment routes
blogRoutes.post("/comment/:blogId", validateAccessToken, addCommentController);
blogRoutes.post("/comment/:blogId/:commentId/hide", validateAccessToken, hideCommentController);
blogRoutes.post("/comment/:blogId/:commentId/show", validateAccessToken, showCommentController);

export default blogRoutes;
