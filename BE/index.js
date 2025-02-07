import express from "express";
import "dotenv/config";
import usersRouter from "./src/routes/users.routers.js";
import vaccinceRouter from "./src/routes/vaccines.routers.js";
import connectToDatabase from "./src/config/database.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";

const app = express();
app.use(express.json());

// Đảm bảo PORT được thiết lập đúng
const PORT = 8080 || process.env.MONGO_URI;

connectToDatabase.connect();

// Route mặc định
app.get("", async (req, res) => {
  console.log("Nothing");
  res.send("Hello World");
});

// Routes API hiện tại
app.use("/user", usersRouter);
app.use("/vaccince", vaccinceRouter);

// Route Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Swagger UI tại http://localhost:${PORT}/api-docs`);
});
