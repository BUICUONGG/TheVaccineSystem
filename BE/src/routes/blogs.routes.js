import { Router } from "express";
import {
  showBlogsController,
  createBlogController,
  incrementViewsController,
  toggleLikeController
} from "../controllers/blog.controllers.js";

const blogRoutes = Router();

blogRoutes.get("/showBlog", showBlogsController);
blogRoutes.post("/createBlog", createBlogController);
blogRoutes.put("/incrementViews/:blogId", incrementViewsController);
blogRoutes.put("/like/:blogId", toggleLikeController);

export default blogRoutes;
