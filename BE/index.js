import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import usersRouter from "./src/routes/users.routes.js";
import vaccinesRouter from "./src/routes/vaccines.routes.js";
import childRouter from "./src/routes/child.routes.js";
// import appointmentRouter from "./src/routes/appointment.routers.js";
import connectToDatabase from "./src/config/database.js";
import cors from "cors";
import blogRoutes from "./src/routes/blogs.routes.js";
const app = express();
app.use(express.json());
const PORT = 8080 || process.env.MONGO_URI;
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

// Routes API hiện tại
app.use("/user", usersRouter);
app.use("/vaccine", vaccinesRouter);
app.use("/child", childRouter);
app.use("/blog", blogRoutes);
// app.use("/admin", adminRouter);
// app.use('staff', staffRouter);

// Route Swagger UI

// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
