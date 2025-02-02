import { MongoClient } from "mongodb";
import "dotenv/config";

const DB_URI = process.env.MONGO_URI; // Lấy URL từ biến môi trường
const client = new MongoClient(DB_URI);

let dbInstance = null; // Biến lưu trữ kết nối database

// Hàm kết nối MongoDB
async function connectToDatabase() {
  if (!dbInstance) {
    try {
      await client.connect();
      console.log("Kết nối MongoDB thành công!");
      dbInstance = client.db("test"); // Thay bằng tên database của bạn
    } catch (error) {
      console.error("Lỗi kết nối MongoDB:", error);
      throw error;
    }
  }
  return dbInstance;
}

export default connectToDatabase;
