import connectToDatabase from "../config/database.js";
import Blog from "../model/blogSchema.js";
import { ObjectId } from "mongodb";
class BlogService {
  async showData() {
    try {
      const result = await connectToDatabase.blogs.find().toArray();
      if (!result || result.length === 0) {
        throw new Error("Không có dữ liệu child");
      }
      return result;
    } catch (error) {
      console.error("Display data error:", error);
      throw new Error(error.message);
    }
  }

  async createBlog(blogData) {
    try {
      const blog = new Blog(blogData);
      await blog.validate();
      const result = await connectToDatabase.blogs.insertOne(blog);
      return { _id: result.insertedId, ...blogData };
    } catch (error) {
      console.error("Create child error", error.message);
      throw new Error({ error: error.message });
    }
  }

  async incrementViews(blogId) {
    try {
      const result = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { views: 1 } },
        { new: true }
      );
      if (!result) {
        throw new Error("Blog not found");
      }
      return result;
    } catch (error) {
      console.error("Increment views error:", error);
      throw new Error(error.message);
    }
  }

  async toggleLike(blogId) {
    try {
      const blog = await Blog.findById(blogId);
      if (!blog) {
        throw new Error("Blog not found");
      }

      blog.likes += 1;
      await blog.save();
      return blog;
    } catch (error) {
      console.error("Like error:", error);
      throw new Error(error.message);
    }
  }

  async updateBlog(id, dataUpdate) {
    try {
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
