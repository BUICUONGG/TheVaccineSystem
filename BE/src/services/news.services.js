import connectToDatabase from "../config/database.js";
import News from "../model/newsSchema.js";
import { ObjectId } from "mongodb";

class NewsService {
    // Get all published news with pagination
    async getAllNews(page = 1, limit = 10, status = "published") {
        try {
            const skip = (page - 1) * limit;
            const query = { status };
            
            const result = await connectToDatabase.news.find(query)
                .sort({ createDate: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
                
            const total = await connectToDatabase.news.countDocuments(query);
            
            if (!result || result.length === 0) {
                return {
                    data: [],
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                };
            }
            
            return {
                data: result,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error("Error fetching news:", error);
            throw new Error(error.message);
        }
    }
    
    // Get news by ID
    async getNewsById(id) {
        try {
            // Check if the parameter is an ObjectId
            if (!ObjectId.isValid(id)) {
                throw new Error("Invalid news ID");
            }
            
            const query = { _id: new ObjectId(id) };
            const result = await connectToDatabase.news.findOne(query);
            
            if (!result) {
                throw new Error("News not found");
            }
            
            return result;
        } catch (error) {
            console.error("Error fetching news by ID:", error);
            throw new Error(error.message);
        }
    }
    
    // Get news by category
    async getNewsByCategory(category, page = 1, limit = 10) {
        try {
            // Validate category against the enum values in schema
            const validCategories = ["tin-tuc-suc-khoe", "hoat-dong", "tu-van", "general"];
            if (!validCategories.includes(category)) {
                throw new Error("Invalid category");
            }
            
            const skip = (page - 1) * limit;
            const query = { category, status: "published" };
            
            const result = await connectToDatabase.news.find(query)
                .sort({ createDate: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
                
            const total = await connectToDatabase.news.countDocuments(query);
            
            return {
                data: result,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error("Error fetching news by category:", error);
            throw new Error(error.message);
        }
    }
    
    // Get featured news
    async getFeaturedNews(limit = 5) {
        try {
            const result = await connectToDatabase.news.find({ 
                featured: true, 
                status: "published" 
            })
            .sort({ createDate: -1 })
            .limit(limit)
            .toArray();
            
            return result;
        } catch (error) {
            console.error("Error fetching featured news:", error);
            throw new Error(error.message);
        }
    }
    
    // Search news
    async searchNews(query, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            // Create text search query
            const searchQuery = {
                $text: { $search: query },
                status: "published"
            };
            
            const result = await connectToDatabase.news.find(searchQuery)
                .sort({ score: { $meta: "textScore" } })
                .skip(skip)
                .limit(limit)
                .toArray();
                
            const total = await connectToDatabase.news.countDocuments(searchQuery);
            
            return {
                data: result,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error("Error searching news:", error);
            throw new Error(error.message);
        }
    }

    // Create news
    async createNews(newsData) {
        try {
            // Validate category
            const validCategories = ["tin-tuc-suc-khoe", "hoat-dong", "tu-van", "general"];
            if (!validCategories.includes(newsData.category)) {
                throw new Error("Invalid category");
            }
            
            const news = new News(newsData);
            await news.validate();
            const result = await connectToDatabase.news.insertOne(news);
            return { _id: result.insertedId, ...newsData };
        } catch (error) {
            console.error("Create news error:", error);
            throw new Error(error.message);
        }
    }

    // Update news
    async updateNews(id, dataUpdate) {
        try {
            // Validate category if provided
            if (dataUpdate.category) {
                const validCategories = ["tin-tuc-suc-khoe", "hoat-dong", "tu-van", "general"];
                if (!validCategories.includes(dataUpdate.category)) {
                    throw new Error("Invalid category");
                }
            }
            
            // Add updateDate
            dataUpdate.updateDate = new Date();
            
            const result = await connectToDatabase.news.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: dataUpdate },
                { returnDocument: "after" }
            );
            
            if (!result) {
                throw new Error("News not found");
            }
            
            return result;
        } catch (error) {
            console.error("Update news error:", error);
            throw new Error(error.message);
        }
    }

    // Delete news (permanent delete)
    async deleteNews(id) {
        try {
            const result = await connectToDatabase.news.findOneAndDelete(
                { _id: new ObjectId(id) }
            );
            
            if (!result) {
                throw new Error("News not found");
            }
            
            return { message: "News deleted successfully" };
        } catch (error) {
            console.error("Delete news error:", error);
            throw new Error(error.message);
        }
    }
    
    // Archive news (soft delete)
    async archiveNews(id) {
        try {
            const result = await connectToDatabase.news.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { status: "archived", updateDate: new Date() } },
                { returnDocument: "after" }
            );
            
            if (!result) {
                throw new Error("News not found");
            }
            
            return result;
        } catch (error) {
            console.error("Archive news error:", error);
            throw new Error(error.message);
        }
    }

    // Restore news
    async restoreNews(id) {
        try {
            const result = await connectToDatabase.news.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { status: "published", updateDate: new Date() } },
                { returnDocument: "after" }
            );
            
            if (!result) {
                throw new Error("News not found");
            }
            
            return result;
        } catch (error) {
            console.error("Restore news error:", error);
            throw new Error(error.message);
        }
    }
    
    // Increment view count
    async incrementViewCount(id) {
        try {
            const result = await connectToDatabase.news.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $inc: { viewCount: 1 } },
                { returnDocument: "after" }
            );
            
            if (!result) {
                throw new Error("News not found");
            }
            
            return result;
        } catch (error) {
            console.error("Increment view count error:", error);
            throw new Error(error.message);
        }
    }
    
    // Get related news
    async getRelatedNews(id, limit = 3) {
        try {
            // First get the news item
            const news = await this.getNewsById(id);
            
            if (!news) {
                throw new Error("News not found");
            }
            
            // Find related news by category
            const relatedNews = await connectToDatabase.news.find({
                _id: { $ne: new ObjectId(id) }, // Exclude current news
                status: "published",
                category: news.category
            })
            .sort({ createDate: -1 })
            .limit(limit)
            .toArray();
            
            return relatedNews;
        } catch (error) {
            console.error("Get related news error:", error);
            throw new Error(error.message);
        }
    }
}

const newsService = new NewsService();
export default newsService;

