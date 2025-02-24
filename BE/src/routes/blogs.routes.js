import { Router } from "express";
import {
  showBlogsController,
  createBlogController,
  incrementViewsController,
  toggleLikeController,
  updateBlogController,
  deleteBlogController,
} from "../controllers/blog.controllers.js";

const blogRoutes = Router();

//PATH:          http://localhost:8080/blog/......

blogRoutes.get("/showBlog", showBlogsController);
blogRoutes.post("/createBlog", createBlogController);
blogRoutes.put("/incrementViews/:blogId", incrementViewsController);
blogRoutes.put("/like/:blogId", toggleLikeController);
blogRoutes.post("/update/:id", updateBlogController);
blogRoutes.post("/delete/:id", deleteBlogController);
export default blogRoutes;
