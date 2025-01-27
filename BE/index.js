// import { Router } from "express";

// app.use("./users", usersRouter);
// app.use("./vaccince", vaccinceRouter);
import dotenv from "dotenv";
dotenv.config();
import express from "express";

import { MongoClient } from "mongodb";
const app = express();
const PORT = 8080 || process.env.PORT;

const dbName = "test";
const collectionName = "users";

const client = new MongoClient(process.env.MONGO_URI);

async function connectAndFetchData() {
  try {
    // Kết nối tới MongoDB
    await client.connect();
    console.log("Kết nối thành công tới MongoDB!");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    return [];
  }
}

app.get("", async (req, res) => {
  const data = await connectAndFetchData();
  res.json(data); // Trả về dữ liệu JSON
});

export default connectAndFetchData();

// Start server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost${PORT}}`);
});
