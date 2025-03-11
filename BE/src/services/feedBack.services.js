import Feedback from "../model/feedbackSchema.js";
import connectToDatabase from "../config/database.js";

class FeedbackService {
  async createFeedback(data) {
    try {
      const feedback = new Feedback(data);
      await feedback.validate();
      await connectToDatabase.feedbacks.insertOne(feedback);
      return { ...data };
    } catch (error) {
      console.log("đây là lỗi feedbackService", error.message);
      throw new Error(error.message);
    }
  }

  async getAllfeedback() {
    try {
      const result = await connectToDatabase.feedbacks.find().toArray();
      return result;
    } catch (error) {
      console.log("Lỗi dòng 22 feedbackService", error.message);
      throw new Error(error.message);
    }
  }
}

const feedbackService = new FeedbackService();
export default feedbackService;
