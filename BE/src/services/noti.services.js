import connectToDatabase from "../config/database.js";
import Notification from "../model/notificationSchema.js";
import { ObjectId } from "mongodb";
class NotiService {
  async createNoti(data) {
    try {
      const noti = new Notification(data);
      // Tạo document thông báo
      const result = await connectToDatabase.notifications.insertOne(noti);
      return { ...data };
    } catch (error) {
      console.log("Lỗi khi tạo thông báo:", error.message);
      throw new Error(error.message);
    }
  }

  async getNoti(cusId) {
    try {
      const notifications = await connectToDatabase.notifications
        .find({ cusId: new ObjectId(cusId) })
        .toArray();
      return notifications;
    } catch (error) {
      console.log("Lỗi khi lấy thông báo:", error.message);
      throw new Error(error.message);
    }
  }

  async deleteNotiById(aptId) {
    return await connectToDatabase.notifications.deleteMany({ apt: aptId });
  }
}

const notiService = new NotiService();
export default notiService;
