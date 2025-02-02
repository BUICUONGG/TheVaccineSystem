// import express from "express";
// import { MongoClient } from "mongodb";
// import "dotenv/config";

// const app = express();
// const PORT = 8080 || process.env.PORT;

// // URL kết nối đến MongoDB (thay B_URIthế bằng URL của bạn)
// const DB_URI = process.env.MONGO_URI;
// const client = new MongoClient(DB_URI);

// // Tên database và collection
// const dbName = "test";
// const collectionName = "users";

// async function connectAndFetchData() {
//   try {
//     // Kết nối tới MongoDB
//     await client.connect();
//     const db = client.db(dbName);
//     const collection = db.collection(collectionName);
//     console.log("Kết nối thành công tới MongoDB!");

//     // Lấy dữ liệu từ collection
//     const data = await collection.find({}).toArray();
//     return data;
//   } catch (error) {
//     console.error("Lỗi kết nối MongoDB:", error);
//     return [];
//   }
// }

// // Route hiển thị dữ liệu JSON
// app.get("", async (req, res) => {
//   const data = await connectAndFetchData();
//   res.json(data); // Trả về dữ liệu JSON
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server đang chạy tại http://localhost:${PORT}`);
// });

import { connectToDatabase } from "./src/config/mongodb";

import express from "express";
// Import module kết nối MongoDB
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8080;

// Route lấy dữ liệu từ MongoDB
app.get("", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("users");

    // Lấy dữ liệu từ collection
    const data = await collection.find({}).toArray();
    res.json(data); // Trả về dữ liệu JSON
  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
