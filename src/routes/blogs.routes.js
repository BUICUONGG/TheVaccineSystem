import { Router } from "express";
import {
  showBlogsController,
  createBlogController,
  incrementViewsController,
  toggleLikeController,
  updateBlogController,
  deleteBlogController,
  restoreBlogController,
  getBlogBySlugController,
  rateBlogController,
  getRelatedBlogsController,
  getPopularTagsController,
  addCommentController
} from "../controllers/blog.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";
import { validateSlug } from "../middlewares/blog.middleware.js";

const blogRoutes = Router();

//PATH:          http://localhost:8080/blog/......

// Hiển thị blog với các tùy chọn lọc và phân trang
blogRoutes.get("/showBlog", showBlogsController);

// Lấy danh sách tags phổ biến
blogRoutes.get("/tags/popular", getPopularTagsController);

// Lấy blog theo slug
blogRoutes.get("/:slug", validateSlug, getBlogBySlugController);

// Lấy các blog liên quan
blogRoutes.get("/related/:blogId", getRelatedBlogsController);

// Tạo blog mới
blogRoutes.post("/createBlog", validateAccessToken, createBlogController);

// Tăng lượt xem
blogRoutes.post(
  "/incrementViews/:blogId",
  incrementViewsController
);

// Thích blog
blogRoutes.post(
  "/like/:blogId", 
  validateAccessToken, 
  toggleLikeController
);

// Đánh giá blog
blogRoutes.post(
  "/rate/:blogId", 
  validateAccessToken, 
  rateBlogController
);

// Thêm bình luận
blogRoutes.post(
  "/comment/:blogId",
  validateAccessToken,
  addCommentController
);

// Cập nhật blog
blogRoutes.post(
  "/update/:id", 
  validateAccessToken, 
  updateBlogController
);

// Xóa blog
blogRoutes.post(
  "/delete/:id", 
  validateAccessToken, 
  deleteBlogController
);

// Khôi phục blog
blogRoutes.post(
  "/restore/:id", 
  validateAccessToken, 
  restoreBlogController
);

export default blogRoutes;
