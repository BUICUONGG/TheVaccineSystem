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
    enum: ["lich-tiem-chung", "hoat-dong-tiem-chung", "quy-trinh-tiem-chung","nhung-dieu-can-biet-truoc-khi-tiem","nhung-dieu-can-biet-sau-khi-tiem", "khac"]
  },
  tags: { type: [String], default: [] },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ["active", "none"], default: "none" },
  thumbnail: { type: String, default: "" },
  readingTime: { type: Number, default: 0 }, // Thời gian đọc ước tính (phút)
  comments: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "hidden"], default: "active" }
  }]
});

// tu dong tạo slug từ tiêu đề
blogSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.blogTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  
  // Tính toán thời gian đọc dựa trên độ dài nội dung
  const wordsPerMinute = 200; // Trung bình người đọc đọc 200 từ/phút
  const wordCount = this.blogContent.split(/\s+/).length;
  this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
