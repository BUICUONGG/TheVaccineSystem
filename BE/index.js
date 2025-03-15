import express from "express";
import path from "path";
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import connectToDatabase from "./src/config/database.js";
import cors from "cors";
import blogRoutes from "./src/routes/blogs.routes.js";
import newsRoutes from "./src/routes/news.routes.js";
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
import feedbackRoutes from "./src/routes/feedback.routes.js";

//====================================================
import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment/moment.js";
//====================================================
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
app.use("/news", newsRoutes);
app.use("/customer", customerRoutes);
app.use("/appointmentLe", aptLeRoutes);
app.use("/vaccineimport", vaccineImportRoutes);
app.use("/appointmentGoi", aptGoiRoutes);
app.use("/staff", staffRoutes);
app.use("/vaccinepakage", vaccinePakageRoutes);
app.use("/noti", notiRoutes);
app.use("/feedback", feedbackRoutes);
app.use(express.urlencoded({ extended: true }));
// ====================== CẤU HÌNH ZALOPAY ======================
const config = {
  appid: "554",
  key1: "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn",
  key2: "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny",
  endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder",
};

app.post("/payment", async (req, res) => {
  try {
    const embed_data = {
      redirecturl: "http://localhost5173/homepage",
    };

    const items = [{}]; // Lưu ý: Cần truyền dữ liệu hợp lệ vào mảng này
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      appid: config.appid,
      apptransid: `${moment().format("YYMMDD")}_${transID}`, // Mã giao dịch có định dạng yyMMdd_xxxx
      appuser: "demo",
      apptime: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embeddata: JSON.stringify(embed_data),
      amount: 1000000000,
      description: "ZaloPay Integration Demo",
      bankcode: "",
    };

    // Chuỗi dữ liệu cần hash
    const dataToHash = [
      config.appid,
      order.apptransid,
      order.appuser,
      order.amount,
      order.apptime,
      order.embeddata,
      order.item,
    ].join("|");

    order.mac = CryptoJS.HmacSHA256(dataToHash, config.key1).toString();

    // Gửi yêu cầu tới ZaloPay
    const result = await axios.post(config.endpoint, null, { params: order });

    // Trả về kết quả cho client
    return res.json({
      success: true,
      message: "Giao dịch đã được tạo",
      data: result.data,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán:", error.message);

    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi tạo giao dịch",
      error: error.message,
    });
  }
});

// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
