import connectToDatabase from "../config/database.js";

class NotiService {
  async createNoti(data) {
    try {
      const noti = new Notification();
      const result = await connectToDatabase.notifications.insertOne();
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async getNoti(cusId) {}
}

const notiService = new NotiService();
export default notiService;
