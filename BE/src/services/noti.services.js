import connectToDatabase from "../config/database.js";
import Notification from "../model/notificationSchema.js";

class NotiService {
  async createNoti(data) {
    try {
      const noti = new Notification(data);

      const result = await connectToDatabase.notifications.insertOne();
      return result;
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getNoti(cusId) {}
}

const notiService = new NotiService();
export default notiService;
