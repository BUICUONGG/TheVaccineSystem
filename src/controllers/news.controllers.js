import newsService from "../services/news.services.js";

// Get all news with pagination
export const getAllNewsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "published" } = req.query;
    const news = await newsService.getAllNews(
      parseInt(page), 
      parseInt(limit), 
      status
    );
    return res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching all news:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get news by ID or slug
export const getNewsByIdController = async (req, res) => {
  try {
    const idOrSlug = req.params.id || req.params.slug;
    const news = await newsService.getNewsById(idOrSlug);
    return res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news by ID:", error);
    return res.status(404).json({ error: error.message });
  }
};

// Get news by category
export const getNewsByCategoryController = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const news = await newsService.getNewsByCategory(
      category,
      parseInt(page),
      parseInt(limit)
    );
    return res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news by category:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get featured news
export const getFeaturedNewsController = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const news = await newsService.getFeaturedNews(parseInt(limit));
    return res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching featured news:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Search news
export const searchNewsController = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const news = await newsService.searchNews(
      q,
      parseInt(page),
      parseInt(limit)
    );
    return res.status(200).json(news);
  } catch (error) {
    console.error("Error searching news:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Create news
export const createNewsController = async (req, res) => {
  try {
    // Add userId from authenticated user
    const newsData = {
      ...req.body,
      userId: req.user.id,
      createDate: new Date(),
      status: req.body.status || "draft"
    };
    
    const news = await newsService.createNews(newsData);
    return res.status(201).json({ 
      message: "News created successfully", 
      news 
    });
  } catch (error) {
    console.error("Error creating news:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Update news
export const updateNewsController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    
    // Prevent updating userId
    if (dataUpdate.userId) {
      delete dataUpdate.userId;
    }
    
    const result = await newsService.updateNews(id, dataUpdate);
    return res.status(200).json({
      message: "News updated successfully",
      news: result
    });
  } catch (error) {
    console.error("Error updating news:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Delete news (permanent)
export const deleteNewsController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await newsService.deleteNews(id);
    return res.status(200).json({
      message: "News deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Archive news (soft delete)
export const archiveNewsController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await newsService.archiveNews(id);
    return res.status(200).json({
      message: "News archived successfully",
      news: result
    });
  } catch (error) {
    console.error("Error archiving news:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Restore news
export const restoreNewsController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await newsService.restoreNews(id);
    return res.status(200).json({
      message: "News restored successfully",
      news: result
    });
  } catch (error) {
    console.error("Error restoring news:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Increment view count
export const incrementViewCountController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await newsService.incrementViewCount(id);
    return res.status(200).json({
      message: "View count incremented",
      viewCount: result.viewCount
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Get related news
export const getRelatedNewsController = async (req, res) => {
  try {
    const id = req.params.id;
    const { limit = 3 } = req.query;
    const news = await newsService.getRelatedNews(id, parseInt(limit));
    return res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching related news:", error);
    return res.status(500).json({ error: error.message });
  }
};




