import { Router } from "express";
import {
  showBlogsController,
  createBlogController,
} from "../controllers/blog.controllers.js";

const blogRoutes = Router();

blogRoutes.get("/showData", showBlogsController);
blogRoutes.post("/create", createBlogController);

export default blogRoutes;
