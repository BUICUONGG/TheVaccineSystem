import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  newsTitle: { type: String, required: true },
  newsContent: { type: String, required: true },
  createDate: { type: String },
  status: { type: String, enum: ["active", "none"], default: "none" },
});
const News = mongoose.model("News", newsSchema);

export default News;
