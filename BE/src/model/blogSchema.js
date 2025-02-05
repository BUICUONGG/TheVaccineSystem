import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blogTitle: { type: String, required: true },
  blogContent: { type: String, required: true },
  createDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "none"], default: "draft" },
});
const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
