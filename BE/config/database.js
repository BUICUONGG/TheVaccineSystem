import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const dbName = "test";
const collectionName = "users";

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Kết nối thành công tới MongoDB!");
    return client.db(dbName);
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    throw error;
  }
}

// Xuất các hàm để có thể tái sử dụng
export { connectToDatabase };
