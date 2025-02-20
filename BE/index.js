import express from "express";
import path from "path";
import "dotenv/config";
import cookieParser from "cookie-parser";
import usersRouter from "./src/routes/users.routes.js";
import vaccinesRouter from "./src/routes/vaccines.routes.js";
import childRouter from "./src/routes/child.routes.js";
import connectToDatabase from "./src/config/database.js";
import cors from "cors";
import blogRoutes from "./src/routes/blogs.routes.js";
import customerRoutes from "./src/routes/customers.routes.js";
import { aptGoiRoutes, aptLeRoutes } from "./src/routes/appointments.routes.js";
import { fileURLToPath } from "url";
const app = express();
app.use(express.json());
const PORT =
  8080 ||
  "mongodb+srv://cuongbui10704:cuongbui10704@swp.lg53w.mongodb.net/?retryWrites=true&w=majority&appName=SWP";
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only this frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);
app.use(cookieParser());
connectToDatabase.connect();
// Route mặc định
app.get("", async (req, res) => {
  console.log("Nothing");
  res.send("Hello World");
});

// Định nghĩa đường dẫn tuyệt đối (ES6 không có __dirname như CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cho phép truy cập ảnh trong thư mục 'public/images'
// app.use("/images", express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "src", "public")));

// Routes API hiện tại
app.use("/user", usersRouter);
app.use("/vaccine", vaccinesRouter);
app.use("/child", childRouter);
app.use("/blog", blogRoutes);
app.use("/customer", customerRoutes);
app.use("/appointment", aptLeRoutes);
// app.use("appointment", aptGoiRoutes);
// app.use("/admin", adminRouter);
// app.use('staff', staffRouter);

// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
