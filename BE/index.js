import express from "express";
import { fetchUsers } from "./config/database.js";

const app = express();
const port = 8080;

app.get("", async (req, res) => {
  const data = await fetchUsers();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
