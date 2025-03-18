import blogService from "../services/blog.services.js";

// Get all blogs with pagination
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
    res.status(500).json({ error: error.message });
  }
};

// Get blog by ID
export const getBlogByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await blogService.getBlogById(id);
    return res.status(200).json(blog);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

// Get blogs by category
export const getBlogByCategoryController = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const blogs = await blogService.getBlogByCategory(category, parseInt(page), parseInt(limit));
    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get related blogs
export const getRelatedBlogsController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { limit = 3 } = req.query;
    const blogs = await blogService.getRelatedBlogs(blogId, parseInt(limit));
    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get popular tags
export const getPopularTagsController = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const tags = await blogService.getPopularTags(parseInt(limit));
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Create new blog
export const createBlogController = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      //userId: req.user._id,
      userId: req.user.id,
      createDate: new Date(),
      status: "active"
    };
    
    const blog = await blogService.createBlog(blogData);
    return res.status(201).json({ 
      message: "Blog created successfully", 
      blog 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Update blog
export const updateBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    
    if (dataUpdate.userId) {
      delete dataUpdate.userId;
    }
    
    const result = await blogService.updateBlog(id, dataUpdate);
    return res.status(200).json({
      message: "Blog updated successfully",
      blog: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete blog
export const deleteBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await blogService.deleteBlog(id);
    return res.status(200).json({
      message: "Blog deleted successfully",
      blog: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Restore blog
export const restoreBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await blogService.restoreBlog(id);
    return res.status(200).json({
      message: "Blog restored successfully",
      blog: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Increment views
export const incrementViewsController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const result = await blogService.incrementViews(blogId);
    return res.status(200).json({
      message: "Views incremented successfully",
      views: result.views
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Toggle like
export const toggleLikeController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user._id;
    const result = await blogService.toggleLike(blogId, userId);
    return res.status(200).json({
      message: "Like toggled successfully",
      likes: result.likes
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Rate blog
export const rateBlogController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    
    const result = await blogService.rateBlog(blogId, Number(rating));
    return res.status(200).json({
      message: "Blog rated successfully",
      rating: result.rating
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Add comment
export const addCommentController = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: "Comment content is required" });
    }
    
    const result = await blogService.addComment(blogId, userId, content);
    return res.status(201).json({
      message: "Comment added successfully",
      blog: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Hide comment
export const hideCommentController = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const result = await blogService.updateCommentStatus(blogId, commentId, "hidden");
    return res.status(200).json({
      message: "Comment hidden successfully",
      blog: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Show comment
export const showCommentController = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const result = await blogService.updateCommentStatus(blogId, commentId, "active");
    return res.status(200).json({
      message: "Comment shown successfully",
      blog: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
