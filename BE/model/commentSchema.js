import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cmtContent: { type: String, required: true },
  createDate: { type: Date, default: Date.now },
});
const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
