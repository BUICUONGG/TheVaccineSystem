import { MongoClient } from "mongodb";
import "dotenv/config";
import { Collection } from "mongoose";
import User from "../model/userSchema";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const dbName = "test";
// const collectionName = "users";

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

//môi lần viết hàm kết nối tới db thì dùng cái này
// const db = await connectToDatabase();
// const collection = db.collection(collectionName);

// Xuất các hàm để có thể tái sử dụng
export { connectToDatabase };
