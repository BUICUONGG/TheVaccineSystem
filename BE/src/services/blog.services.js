import connectToDatabase from "../config/database.js";
import Blog from "../model/blogSchema.js";
import { ObjectId } from "mongodb";

class BlogService {
  async showData(options = {}) {
    try {
      let query = {};
      
      // Lọc theo category nếu được cung cấp
      if (options.category) {
        query.category = options.category;
      }
      
      // Lọc theo tags nếu được cung cấp
      if (options.tags && options.tags.length > 0) {
        query.tags = { $in: options.tags };
      }
      
      // Lọc theo trạng thái nếu được cung cấp
      if (options.status) {
        query.status = options.status;
      } else if (!options.includeDeleted) {
        // Mặc định chỉ hiển thị blog active nếu không yêu cầu hiển thị cả blog đã ẩn
        query.status = "active";
      }
      
      // Tìm kiếm theo từ khóa nếu được cung cấp
      if (options.keyword) {
        const keyword = options.keyword;
        query.$or = [
          { blogTitle: { $regex: keyword, $options: 'i' } },
          { blogContent: { $regex: keyword, $options: 'i' } },
          { author: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } }
        ];
      }
      
      // Sắp xếp
      let sort = {};
      if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;
      } else {
        // Mặc định sắp xếp theo ngày tạo mới nhất
        sort = { createDate: -1 };
      }
      
      // Phân trang
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      
      // Thực hiện truy vấn
      const result = await connectToDatabase.blogs
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      // Đếm tổng số bài viết thỏa mãn điều kiện
      const total = await connectToDatabase.blogs.countDocuments(query);
      
      if (!result || result.length === 0) {
        return {
          blogs: [],
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        };
      }
      
      return {
        blogs: result,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error("Display data error:", error);
      throw new Error(error.message);
    }
  }

  async getBlogBySlug(slug) {
    try {
      const blog = await connectToDatabase.blogs.findOne({ slug: slug });
      if (!blog) {
        throw new Error("Blog not found");
      }
      return blog;
    } catch (error) {
      console.error("Get blog by slug error:", error);
      throw new Error(error.message);
    }
  }

  async getRelatedBlogs(blogId, category, tags, limit = 5) {
    try {
      // Tìm các bài viết liên quan dựa trên category và tags
      const query = {
        _id: { $ne: new ObjectId(blogId) }, // Loại trừ bài viết hiện tại
        status: "active",
        $or: [
          { category: category },
          { tags: { $in: tags } }
        ]
      };
      
      const relatedBlogs = await connectToDatabase.blogs
        .find(query)
        .sort({ createDate: -1 })
        .limit(limit)
        .toArray();
        
      return relatedBlogs;
    } catch (error) {
      console.error("Get related blogs error:", error);
      throw new Error(error.message);
    }
  }

  async getPopularTags(limit = 20) {
    try {
      // Lấy danh sách các tags phổ biến nhất
      const pipeline = [
        { $match: { status: "active" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ];
      
      const popularTags = await connectToDatabase.blogs.aggregate(pipeline).toArray();
      return popularTags.map(tag => ({ name: tag._id, count: tag.count }));
    } catch (error) {
      console.error("Get popular tags error:", error);
      throw new Error(error.message);
    }
  }

  async createBlog(blogData) {
    try {
      // Generate slug if not provided
      if (!blogData.slug) {
        blogData.slug = blogData.blogTitle
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Đảm bảo tags là một mảng
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
      console.error("Create blog error", error.message);
      throw new Error({ error: error.message });
    }
  }

  async incrementViews(blogId) {
    try {
      // Chỉ tăng lượt xem cho bài viết có trạng thái "active"
      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { 
          _id: new ObjectId(blogId),
          status: "active" // Chỉ tăng lượt xem cho bài viết đang hoạt động
        },
        { $inc: { views: 1 } },
        { returnDocument: "after" }
      );
      
      if (!result) {
        throw new Error("Blog not found or not active");
      }
      return result;
    } catch (error) {
      console.error("Increment views error:", error);
      throw new Error(error.message);
    }
  }

  async toggleLike(blogId, userId) {
    try {
      // Kiểm tra xem người dùng đã like bài viết chưa
      // Trong thực tế, bạn có thể cần một collection riêng để lưu trữ likes
      
      // Tạm thời chỉ tăng số lượng likes
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
      console.error("Like error:", error);
      throw new Error(error.message);
    }
  }

  async rateBlog(blogId, rating) {
    try {
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
      console.error("Rate blog error:", error);
      throw new Error(error.message);
    }
  }

  async addComment(blogId, userId, content) {
    try {
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
      console.error("Add comment error:", error);
      throw new Error(error.message);
    }
  }

  async updateBlog(id, dataUpdate) {
    try {
      // Update slug if title is changed
      if (dataUpdate.blogTitle && !dataUpdate.slug) {
        dataUpdate.slug = dataUpdate.blogTitle
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Đảm bảo tags là một mảng
      if (dataUpdate.tags && !Array.isArray(dataUpdate.tags)) {
        dataUpdate.tags = [dataUpdate.tags];
      }
      
      // Tính lại thời gian đọc nếu nội dung thay đổi
      if (dataUpdate.blogContent) {
        const wordsPerMinute = 200;
        const wordCount = dataUpdate.blogContent.split(/\s+/).length;
        dataUpdate.readingTime = Math.ceil(wordCount / wordsPerMinute);
      }
      
      const result = await connectToDatabase.blogs.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        { $set: dataUpdate },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteBlog(id) {
    try {
      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: "none" } },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async restoreBlog(id) {
    try {
      const result = await connectToDatabase.blogs.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: "active" } },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const blogService = new BlogService();
export default blogService;
