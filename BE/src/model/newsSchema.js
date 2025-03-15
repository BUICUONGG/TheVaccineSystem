import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  newsTitle: { type: String, required: true, trim: true, maxlength: 200 },
  newsContent: { type: String, required: true },
  summary: { type: String, trim: true, maxlength: 500 },
  slug: { type: String, unique: true, required: true },
  imageUrl: { type: String, default: null },
  thumbnailUrl: { type: String, default: null },
  category: { 
    type: String, 
    enum: [
      "uu-dai", // Ưu đãi hấp dẫn
      "tin-tuc-suc-khoe", // Tin tức sức khoẻ
      "hoat-dong", // Hoạt động VNVC toàn quốc
      "khai-truong", // Khai trương VNVC toàn quốc
      "livestream", // Livestream tư vấn
      "tu-van", // Tư vấn kiến thức sức khoẻ
      "cuoc-thi", // Cuộc thi và sự kiện
      "doi-tac", // Đối tác và hợp tác
      "general" // Other general news
    ], 
    default: "general",
    required: true
  },
  categoryName: { type: String, required: true }, // Display name for the category
  tags: [{ type: String, trim: true }],
  viewCount: { type: Number, default: 0 },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: null },
  status: { type: String, enum: ["published", "draft", "archived"], default: "draft" },
  featured: { type: Boolean, default: false },
  isPromoted: { type: Boolean, default: false }, // For news that should be highlighted
  relatedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: "News" }], // Related news articles
  metaDescription: { type: String, maxlength: 160 }, // For SEO
  metaKeywords: { type: String, maxlength: 200 }, // For SEO
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add text index for search functionality
newsSchema.index({ newsTitle: 'text', newsContent: 'text', tags: 'text', categoryName: 'text' });

// Pre-save hook to generate slug if not provided
newsSchema.pre('save', function(next) {
  if (!this.slug) {
    // Create slug from title
    this.slug = this.newsTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }
  
  // Set categoryName based on category if not provided
  if (!this.categoryName) {
    const categoryMap = {
      'uu-dai': 'Ưu đãi hấp dẫn',
      'tin-tuc-suc-khoe': 'Tin tức sức khoẻ',
      'hoat-dong': 'Hoạt động VNVC toàn quốc',
      'khai-truong': 'Khai trương VNVC toàn quốc',
      'livestream': 'Livestream tư vấn',
      'tu-van': 'Tư vấn kiến thức sức khoẻ',
      'cuoc-thi': 'Cuộc thi và sự kiện',
      'doi-tac': 'Đối tác và hợp tác',
      'general': 'Tin tức chung'
    };
    
    this.categoryName = categoryMap[this.category] || 'Tin tức chung';
  }
  
  next();
});

const News = mongoose.model("News", newsSchema);

export default News;
