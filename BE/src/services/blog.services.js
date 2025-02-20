import connectToDatabase from "../config/database.js";
import Blog from "../model/blogSchema.js";

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
}

const blogService = new BlogService();
export default blogService;
