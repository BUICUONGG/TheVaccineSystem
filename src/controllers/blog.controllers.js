import blogService from "../services/blog.services.js";

export const showBlogsController = async (req, res) => {
  try {
    const options = {
      category: req.query.category,
      tags: req.query.tags ? req.query.tags.split(',') : null,
      keyword: req.query.keyword,
      status: req.query.status,
      includeDeleted: req.query.includeDeleted === 'true',
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    
    const result = await blogService.showData(options);
    return res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBlogBySlugController = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await blogService.getBlogBySlug(slug);
    
    // Tăng lượt xem khi người dùng xem chi tiết blog
    await blogService.incrementViews(blog._id);
    
    return res.json(blog);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getRelatedBlogsController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { category, tags } = req.query;
    const limit = parseInt(req.query.limit) || 5;
    
    const tagsArray = tags ? tags.split(',') : [];
    const relatedBlogs = await blogService.getRelatedBlogs(blogId, category, tagsArray, limit);
    
    return res.json(relatedBlogs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPopularTagsController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const popularTags = await blogService.getPopularTags(limit);
    
    return res.json(popularTags);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createBlogController = async (req, res) => {
  try {
    // Thêm userId từ token xác thực
    const blogData = {
      ...req.body,
      userId: req.user._id
    };
    
    const blog = await blogService.createBlog(blogData);
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const incrementViewsController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const updatedBlog = await blogService.incrementViews(blogId);
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleLikeController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id;
    
    const updatedBlog = await blogService.toggleLike(blogId, userId);
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const rateBlogController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { rating } = req.body;
    
    if (!rating || isNaN(rating)) {
      return res.status(400).json({ error: "Valid rating is required" });
    }
    
    const updatedBlog = await blogService.rateBlog(blogId, Number(rating));
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addCommentController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: "Comment content is required" });
    }
    
    const updatedBlog = await blogService.addComment(blogId, userId, content);
    res.status(201).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    const result = await blogService.updateBlog(id, dataUpdate);

    res.status(200).json(result);
  } catch (error) {
    console.warn("khong update duoc");
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await blogService.deleteBlog(id);
    res.status(200).json(result);
  } catch (error) {
    console.warn("khong the xoa");
    res.status(500).json({ error: error.message });
  }
};

export const restoreBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await blogService.restoreBlog(id);
    res.status(200).json(result);
  } catch (error) {
    console.warn("Không thể khôi phục blog");
    res.status(500).json({ error: error.message });
  }
};
