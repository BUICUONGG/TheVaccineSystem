import express from "express";
import path from "path";
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import connectToDatabase from "./src/config/database.js";
import cors from "cors";
import blogRoutes from "./src/routes/blogs.routes.js";
import customerRoutes from "./src/routes/customers.routes.js";
import { aptGoiRoutes, aptLeRoutes } from "./src/routes/appointments.routes.js";
import { fileURLToPath } from "url";
import vaccineImportRoutes from "./src/routes/vaccineImports.routes.js";
import childRoutes from "./src/routes/child.routes.js";
import usersRoutes from "./src/routes/users.routes.js";
import vaccinesRoutes from "./src/routes/vaccines.routes.js";
import staffRoutes from "./src/routes/staffs.routes.js";
import vaccinePakageRoutes from "./src/routes/vaccinePakages.routes.js";
import notiRoutes from "./src/routes/noti.routes.js";
const app = express();
app.use(express.json());
const PORT = 8080 || process.env.PORT;

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
app.use("/user", usersRoutes);
app.use("/vaccine", vaccinesRoutes);
app.use("/child", childRoutes);
app.use("/blogs", blogRoutes);
app.use("/customer", customerRoutes);
app.use("/appointmentLe", aptLeRoutes);
app.use("/vaccineimport", vaccineImportRoutes);
app.use("/appointmentGoi", aptGoiRoutes);
app.use("/staff", staffRoutes);
app.use("/vaccinepakage", vaccinePakageRoutes);
app.use("/noti", notiRoutes);
// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
