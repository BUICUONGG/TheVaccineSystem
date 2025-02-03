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

async function fetchUsers() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return [];
  }
}

// Xuất các hàm để có thể tái sử dụng
export { connectToDatabase, fetchUsers };
