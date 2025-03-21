import moment from "moment/moment.js";
import CryptoJS from "crypto-js";
import axios from "axios";
// import bodyParser from "body-parser";
import qs from "qs";
import connectToDatabase from "../config/database.js";
import "dotenv/config";
import notiService from "./noti.services.js";
import { ObjectId } from "mongodb";
import appointmentService from "./appointment.services.js";

const config = {
  app_id: process.env.APP_ID,
  key1: process.env.KEY1,
  key2: process.env.KEY2,
  endpoint: process.env.ENDPOINT,
};

class PaymentService {
  async createPayment(paymentData) {
    try {
      const embed_data = {
        redirecturl: "http://localhost:5173/",
      };
      // Chuyển đổi các giá trị sang ObjectId nếu cần
      const transformedPaymentData = {
        ...paymentData,
        cusId: new ObjectId(paymentData.cusId),
        vaccineId: new ObjectId(paymentData.vaccineId),
        vaccinePackageId: new ObjectId(paymentData.vaccinePackageId),
        childId: paymentData.childId ? new ObjectId(paymentData.childId) : null,
        batchId: paymentData.batchId ? new ObjectId(paymentData.batchId) : null,
      };

      const items = [{ transformedPaymentData }];

      const transID = Math.floor(Math.random() * 1000000);
      const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
        app_user: "user123",
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: transformedPaymentData.price,
        description: `Payment for the order #${transID}`,
        bank_code: "",
        callback_url: `${process.env.CALLBACK_URL}/zalopay/callback`,
      };

      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      const result = await axios.post(config.endpoint, null, { params: order });
      const status = "Pending";

      if (paymentData.type === "aptLe") {
        const aptLe = await appointmentService.createAptLe(
          transformedPaymentData
        );

        await connectToDatabase.appointmentLes.updateOne(
          { _id: aptLe._id },
          {
            $set: {
              status: status,
              app_trans_id: order.app_trans_id,
              zp_trans_token: result.data.zp_trans_token,
              order_token: result.data.order_token,
            },
          }
        );
        await notiService.createNoti({
          cusId: transformedPaymentData.cusId,
          apt: aptLe.insertedId,
          aptModel: "AppointmentLe",
          message: `Lịch hẹn lẻ của bạn vào lúc ${paymentData.time} đang trong trạng thái ${status}`,
          createdAt: new Date().toLocaleDateString("vi-VN"),
        });
      } else {
        // Gọi `createAptGoi` để tạo lịch hẹn gói
        const aptGoi = await appointmentService.createAptGoi(
          transformedPaymentData
        );

        // Sau khi tạo lịch hẹn gói, cập nhật thông tin thanh toán
        await connectToDatabase.appointmentGois.updateOne(
          { _id: aptGoi._id },
          {
            $set: {
              status: status,
              app_trans_id: order.app_trans_id,
              zp_trans_token: result.data.zp_trans_token,
              order_token: result.data.order_token,
            },
          }
        );

        await notiService.createNoti({
          cusId: transformedPaymentData.cusId,
          apt: aptGoi._id,
          aptModel: "AppointmentGoi",
          message: `Lịch hẹn gói của bạn vào lúc ${paymentData.time} đang ở trạng thái ${status}`,
          createdAt: new Date().toLocaleDateString("vi-VN"),
        });
      }

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
        return result;
      }

      // Thanh toán thành công, cập nhật database
      const dataJson = JSON.parse(data);
      const { app_trans_id } = dataJson;

      // Kiểm tra đơn hàng có tồn tại trong `appointmentLes`
      const aptLe = await connectToDatabase.appointmentLes.findOne({
        app_trans_id,
      });
      if (aptLe) {
        await connectToDatabase.appointmentLes.updateOne(
          { app_trans_id },
          { $set: { status: "Paid" } }
        );

        // Cập nhật thông báo
        await appointmentService.updateAptLe(aptLe._id, { status: "Paid" });

        result.return_code = 1;
        result.return_message = "success";
        return result;
      }

      // Kiểm tra đơn hàng có tồn tại trong `appointmentGois`
      const aptGoi = await connectToDatabase.appointmentGois.findOne({
        app_trans_id,
      });
      if (aptGoi) {
        await connectToDatabase.appointmentGois.updateOne(
          { app_trans_id },
          { $set: { status: "Paid" } }
        );

        // Cập nhật thông báo
        await appointmentService.updateAptGoi(aptGoi._id, { status: "Paid" });

        result.return_code = 1;
        result.return_message = "success";
        return result;
      }

      // Nếu không tìm thấy trong cả 2 collection
      result.return_code = 0;
      result.return_message = "Order not found";
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
