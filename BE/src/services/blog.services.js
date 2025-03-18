import connectToDatabase from "../config/database.js";
import Blog from "../model/blogSchema.js";
import { ObjectId } from "mongodb";

class BlogService {
  // Get all blogs with pagination and filters
  async showData(options = {}) {
    try {
      let query = {};
      
      // Filter by category
      if (options.category) {
        query.category = options.category;
      }
      
      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        query.tags = { $in: options.tags };
      }
      
      // Filter by status
      if (options.status) {
        query.status = options.status;
      } else if (!options.includeDeleted) {
        query.status = "active";
      }
      
      // Search by keyword
      if (options.keyword) {
        const keyword = options.keyword;
        query.$or = [
          { blogTitle: { $regex: keyword, $options: 'i' } },
          { blogContent: { $regex: keyword, $options: 'i' } },
          { author: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } }
        ];
      }
      
      // Sorting
      let sort = {};
      if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;
      } else {
        sort = { createDate: -1 };
      }
      
      // Get total count before pagination
      const total = await connectToDatabase.blogs.countDocuments(query);
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      
      const blogs = await connectToDatabase.blogs
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return {
        blogs,
        total,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get blog by ID
  async getBlogById(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid blog ID");
      }

      const blog = await connectToDatabase.blogs.findOne({ 
        _id: new ObjectId(id),
        status: "active"
      });

      if (!blog) {
        throw new Error("Blog not found");
      }

      return blog;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get blogs by category
  async getBlogByCategory(category, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { 
        category,
        status: "active"
      };

      const blogs = await connectToDatabase.blogs
        .find(query)
        .sort({ createDate: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await connectToDatabase.blogs.countDocuments(query);

      return {
        blogs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get related blogs
  async getRelatedBlogs(blogId, limit = 3) {
    try {
      const blog = await this.getBlogById(blogId);
      
      const query = {
        _id: { $ne: new ObjectId(blogId) },
        status: "active",
        $or: [
          { category: blog.category },
          { tags: { $in: blog.tags || [] } }
        ]
      };

      const relatedBlogs = await connectToDatabase.blogs
        .find(query)
        .sort({ createDate: -1 })
        .limit(limit)
        .toArray();

      return relatedBlogs;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get popular tags
  async getPopularTags(limit = 20) {
    try {
      const pipeline = [
        { $match: { status: "active" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ];
      
      const popularTags = await connectToDatabase.blogs
        .aggregate(pipeline)
        .toArray();

      return popularTags.map(tag => ({ 
        name: tag._id, 
        count: tag.count 
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Create new blog
  async createBlog(blogData) {
    try {
      if (blogData.tags && !Array.isArray(blogData.tags)) {
        blogData.tags = [blogData.tags];
      } else if (!blogData.tags) {
        blogData.tags = [];
      }
      
      const blog = new Blog(blogData);
      await blog.validate();
      
      const result = await connectToDatabase.blogs.insertOne(blog);
      return { _id: result.insertedId, ...blogData };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update blog
  async updateBlog(id, dataUpdate) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid blog ID");
      }

      if (dataUpdate.tags && !Array.isArray(dataUpdate.tags)) {
        dataUpdate.tags = [dataUpdate.tags];
      }
      
      if (dataUpdate.blogContent) {
        const wordsPerMinute = 200;
        const wordCount = dataUpdate.blogContent.split(/\s+/).length;
        dataUpdate.readingTime = Math.ceil(wordCount / wordsPerMinute);
      }

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: dataUpdate },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog not found");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Delete blog (soft delete)
  async deleteBlog(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid blog ID");
      }

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: "none" } },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog not found");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Restore blog
  async restoreBlog(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid blog ID");
      }

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: "active" } },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog not found");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Increment views
  async incrementViews(blogId) {
    try {
      if (!ObjectId.isValid(blogId)) {
        throw new Error("Invalid blog ID");
      }

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { 
          _id: new ObjectId(blogId),
          status: "active"
        },
        { $inc: { views: 1 } },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog not found or not active");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Toggle like
  async toggleLike(blogId, userId) {
    try {
      if (!ObjectId.isValid(blogId)) {
        throw new Error("Invalid blog ID");
      }

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(blogId) },
        { $inc: { likes: 1 } },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog not found");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Rate blog
  async rateBlog(blogId, rating) {
    try {
      if (!ObjectId.isValid(blogId)) {
        throw new Error("Invalid blog ID");
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(blogId) },
        { $set: { rating: rating } },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog not found");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Add comment
  async addComment(blogId, userId, content) {
    try {
      if (!ObjectId.isValid(blogId)) {
        throw new Error("Invalid blog ID");
      }

      const comment = {
        userId: new ObjectId(userId),
        content,
        createdAt: new Date(),
        status: "active"
      };

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(blogId) },
        { $push: { comments: comment } },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog not found");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update comment status
  async updateCommentStatus(blogId, commentId, status) {
    try {
      if (!ObjectId.isValid(blogId)) {
        throw new Error("Invalid blog ID");
      }

      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { 
          _id: new ObjectId(blogId),
          "comments.userId": new ObjectId(commentId)
        },
        { $set: { "comments.$.status": status } },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Blog or comment not found");
      }

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const blogService = new BlogService();
export default blogService;
