import express from "express";
import "dotenv/config";
import usersRouter from "./src/routes/users.routers.js";

const app = express();
app.use(express.json());
const PORT = 8080 || process.env.MONGO_URI;

app.get("", async (req, res) => {
  console.log("Nothing");
});

app.use("user", usersRouter);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
