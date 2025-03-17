import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  newsTitle: { type: String, required: true, trim: true, maxlength: 200 },
  newsContent: { type: String, required: true },
  imageUrl: { type: String, default: null },
  thumbnailUrl: { type: String, default: null },
  category: { 
    type: String, 
    enum: [
      "tin-tuc-suc-khoe", // Tin tức sức khoẻ
      "hoat-dong", // Hoạt động VNVC toàn quốc
      "tu-van", // Tư vấn kiến thức sức khoẻ
      "general" // Other general news
    ], 
    default: "general",
    required: true
  },
  viewCount: { type: Number, default: 0 },
  createDate: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  relatedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: "News" }], 
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add text index for search functionality
newsSchema.index({ newsTitle: 'text', newsContent: 'text', tags: 'text', categoryName: 'text' });


const News = mongoose.model("News", newsSchema);

export default News;
