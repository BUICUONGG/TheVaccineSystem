import blogService from "../services/blog.services.js";

export const showBlogsController = async (req, res) => {
  try {
    const blogs = await blogService.showData();
    return res.json(blogs);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

export const createBlogController = async (req, res) => {
  try {
    const blog = await blogService.createBlog(req.body);
    res.status(201).json({ message: "Blogscreated successfully", blog });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
