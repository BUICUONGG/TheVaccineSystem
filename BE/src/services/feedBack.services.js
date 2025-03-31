import Feedback from "../model/feedbackSchema.js";
import connectToDatabase from "../config/database.js";
import { ObjectId } from "mongodb";
class FeedbackService {
  async createFeedback(data) {
    try {
      // Check if user already has a feedback
      const existingFeedback = await connectToDatabase.feedbacks.findOne({
        cusId: new ObjectId(data.cusId)
      });

      if (existingFeedback) {
        throw new Error("Bạn đã gửi đánh giá trước đó. Không thể gửi thêm đánh giá mới.");
      }

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

  async getFeedbackByCusId(cusId) {
    try {
      const result = await connectToDatabase.feedbacks.findOne({
        cusId: new ObjectId(cusId)
      });
      return result;
    } catch (error) {
      console.log("Lỗi khi lấy feedback theo cusId", error.message);
      throw new Error(error.message);
    }
  }

  async updateFeedback(id, dataUpdate) {
    try {
      const result = await connectToDatabase.feedbacks.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        { $set: dataUpdate },
        { returnDocument: "after" }
      );
      return result;
    } catch (error) {
      console.log("đây là lỗi dòng 31 feedbackService", error.message);
      throw new Error(error.message);
    }
  }

  async deleteFeedback(id) {
    try {
      await connectToDatabase.feedbacks.findOneAndDelete({
        _id: new ObjectId(id),
      });
      return "Xoa thanh cong";
    } catch (error) {
      console.log("Đây là lỗi dòng 50 feedbackService", error.message);
      throw new Error(error.message);
    }
  }
}

const feedbackService = new FeedbackService();
export default feedbackService;
