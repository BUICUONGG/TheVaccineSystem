import express from "express";
import "dotenv/config";
import usersRouter from "./src/routes/users.routers.js";
import vaccineRouter from "./src/routes/vaccines.routers.js";
import connectToDatabase from "./src/config/database.js";

const app = express();
app.use(express.json());
const PORT = 8080 || process.env.MONGO_URI;

connectToDatabase.connect();
// Route mặc định
app.get("", async (req, res) => {
  console.log("Nothing");
  res.send("Hello World");
});

// Routes API hiện tại
app.use("/user", usersRouter);
app.use("/vaccine", vaccineRouter);
// app.use("/admin", adminRouter);
// app.use('staff', staffRouter);

// Route Swagger UI

// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
