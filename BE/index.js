import express from "express";
import path from "path";
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
import paymentRoutes from "./src/routes/payment.routes.js";
// import qs from "qs";
// // ====================================================
// import axios from "axios";
// import CryptoJS from "crypto-js";
// import moment from "moment/moment.js";

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
app.use("/zalopay", paymentRoutes);
app.use(express.urlencoded({ extended: true }));

// ====================== CẤU HÌNH ZALOPAY ======================
// const config = {
//   app_id: "2554",
//   key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
//   key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
//   endpoint: "https://sb-openapi.zalopay.vn/v2/create",
// };

// app.post("/payment", async (req, res) => {
//   const embed_data = {
//     redirecturl: "http://localhost:5173/",
//   };

//   const items = [
//     {
//       itemid: "001",
//       itemname: "Gói vaccine ABC",
//       itemprice: 50000,
//       itemquantity: 1,
//     },
//   ];

//   const transID = Math.floor(Math.random() * 1000000);
//   const order = {
//     app_id: config.app_id,
//     app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
//     app_user: "user123",
//     app_time: Date.now(), // miliseconds
//     item: JSON.stringify(items),
//     embed_data: JSON.stringify(embed_data),
//     amount: 50000,
//     description: `Lazada - Payment for the order #${transID}`,
//     bank_code: "",
//     callback_url: "https://ea2d-58-187-185-8.ngrok-free.app/callback",
//   };

//   // Chuỗi dữ liệu cần hash
//   const data =
//     config.app_id +
//     "|" +
//     order.app_trans_id +
//     "|" +
//     order.app_user +
//     "|" +
//     order.amount +
//     "|" +
//     order.app_time +
//     "|" +
//     order.embed_data +
//     "|" +
//     order.item;
//   order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
//   // Gửi yêu cầu tới ZaloPay
//   // const result = await axios.post(config.endpoint, null, { params: order });
//   try {
//     const result = await axios.post(config.endpoint, null, { params: order });
//     return res.status(200).json(result.data);
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// app.post("/callback", (req, res) => {
//   let result = {};

//   try {
//     let dataStr = req.body.data;
//     let reqMac = req.body.mac;

//     let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
//     console.log("mac =", mac);

//     // kiểm tra callback hợp lệ (đến từ ZaloPay server)
//     if (reqMac !== mac) {
//       // callback không hợp lệ
//       result.return_code = -1;
//       result.return_message = "mac not equal";
//     } else {
//       // thanh toán thành công
//       // merchant cập nhật trạng thái cho đơn hàng
//       let dataJson = JSON.parse(dataStr, config.key2);
//       console.log(
//         "update order's status = success where app_trans_id =",
//         dataJson["app_trans_id"]
//       );

//       result.return_code = 1;
//       result.return_message = "success";
//     }
//   } catch (ex) {
//     result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
//     result.return_message = ex.message;
//   }

//   // thông báo kết quả cho ZaloPay server
//   res.json(result);
// });

// app.post("/order-status/:id", async (req, res) => {
//   const app_trans_id = req.params.id;
//   let postData = {
//     app_id: config.app_id,
//     app_trans_id: app_trans_id, // Input your apptransid
//   };

//   let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
//   postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

//   let postConfig = {
//     method: "post",
//     url: "https://sb-openapi.zalopay.vn/v2/query",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     data: qs.stringify(postData),
//   };

//   try {
//     const result = await axios(postConfig);
//     return res.status(200).json(result.data);
//   } catch (error) {
//     console.log(error.message);
//   }
// });

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
