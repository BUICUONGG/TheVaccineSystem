import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blogTitle: { type: String, required: true },
  blogContent: { type: String, required: true },
  createDate: { type: Date, default: Date.now },
  author: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  category: { 
    type: String, 
    required: true,
    enum: [
      "lich-tiem-chung", 
      "hoat-dong-tiem-chung",
       "quy-trinh-tiem-chung",
       "nhung-dieu-can-biet-truoc-khi-tiem",
       "nhung-dieu-can-biet-sau-khi-tiem", 
       "khac"]
  },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["active", "none"], default: "none" },
  comments: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "hidden"], default: "active" }
  }]
});
const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
