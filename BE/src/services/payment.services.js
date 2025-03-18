import moment from "moment/moment.js";
import CryptoJS from "crypto-js";
import axios from "axios";
// import bodyParser from "body-parser";
import qs from "qs";
import connectToDatabase from "../config/database.js";
const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};
class PaymentService {
  async createPayment(paymentData) {
    try {
      const embed_data = { redirecturl: "http://localhost:5173/payment-success" };

      const items = [{ paymentData }];

      const transID = Math.floor(Math.random() * 1000000);
      const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
        app_user: "user123",
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: paymentData.price,
        description: `Payment for the order #${transID}`,
        bank_code: "",
        callback_url:
          "https://ea2d-58-187-185-8.ngrok-free.app/zalopay/callback",
      };

      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      const result = await axios.post(config.endpoint, null, { params: order });
      await connectToDatabase.payments.insertOne({
        app_trans_id: order.app_trans_id,
        zp_trans_token: result.data.zp_trans_token,
        order_token: result.data.order_token,
        cusId: paymentData.cusId,
        vaccineId: paymentData.vaccineId,
        price: paymentData.price,
        type: paymentData.type,
        appointmentData: paymentData.appointmentData,
        status: "PENDING", // Giao dịch đang chờ xử lý
        createdAt: new Date().toLocaleDateString("vi-VN"),
      });
      return result.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async callbackPayment(callbackData) {
    let result = {};
    try {
      const { data, mac: reqMac } = callbackData;

      // Xác minh chữ ký MAC
      const mac = CryptoJS.HmacSHA256(data, config.key2).toString();

      if (reqMac !== mac) {
        result.return_code = -1;
        result.return_message = "mac not equal";
      } else {
        // Thanh toán thành công, cập nhật database
        const dataJson = JSON.parse(data);

        await connectToDatabase.payments.updateOne(
          { app_trans_id: dataJson["app_trans_id"] },
          { $set: { status: "PAID" } }
        );

        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (ex) {
      result.return_code = 0;
      result.return_message = ex.message;
    }
    return result;
  }

  async checkOrderStatus(app_trans_id) {
    let postData = {
      app_id: config.app_id,
      app_trans_id: app_trans_id, // ID đơn hàng cần kiểm tra
    };

    let data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    let postConfig = {
      method: "post",
      url: "https://sb-openapi.zalopay.vn/v2/query",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData),
    };

    try {
      const result = await axios(postConfig);
      return result.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;
