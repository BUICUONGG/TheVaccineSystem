import express from "express";
import "dotenv/config";
import usersRouter from "./src/routes/users.routers.js";
import vaccinceRouter from "./src/routes/vaccinces.routers.js";
import connectToDatabase from "./src/config/database.js";

const app = express();
app.use(express.json());
const PORT = 8080 || process.env.MONGO_URI;

connectToDatabase.connect();

app.get("", async (req, res) => {
  console.log("Nothing");
});

app.use("/user", usersRouter);
app.use("/vaccince", vaccinceRouter);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
