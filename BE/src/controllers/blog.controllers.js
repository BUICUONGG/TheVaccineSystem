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
    const updatedBlog = await blogService.toggleLike(blogId);
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
/*incrementView là một chức năng để tăng số lượt xem (views) 
của một bài blog lên 1 đơn vị mỗi khi có người truy cập vào bài viết đó. */

/*toggleLike là một chức năng để tăng số lượt thích (likes) 
của một bài blog lên 1 đơn vị mỗi khi có người thích bài viết đó. */

export const updateBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    const result = await blogService.updateBlog(id, dataUpdate);

    res.status(200).json(result);
  } catch (error) {
    console.warn("khong update duoc");
    res.status(500).json(error.message);
  }
};

export const deleteBlogController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await blogService.deleteBlog(id);
    res.status(200).json(result);
  } catch (error) {
    console.warn("khong the xoa");
    res.status(500).json(error.message);
  }
};
