import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  cusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  createAt: { type: String },
});
const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
