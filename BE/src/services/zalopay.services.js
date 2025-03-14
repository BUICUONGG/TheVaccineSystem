import crypto from "crypto";
import axios from "axios";

const zaloPayConfig = {
  app_id: "3729943403769793162",
  key1: "your_key_here", // Replace with your actual key
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

async function createZaloPayOrder(cusId, price) {
  const now = new Date();
  const datePart = `${now.getFullYear().toString().slice(2)}${(
    "0" +
    (now.getMonth() + 1)
  ).slice(-2)}${("0" + now.getDate()).slice(-2)}`;
  const transID = `${datePart}_${now.getTime()}`; // Format YYMMDD_timestamp

  const items = JSON.stringify([
    { name: "Vaccine Appointment", price, quantity: 1 },
  ]);
  const embedData = JSON.stringify({});

  const orderData = {
    app_id: zaloPayConfig.app_id,
    app_trans_id: transID,
    app_user: cusId.toString(),
    app_time: Date.now(),
    amount: price,
    item: items,
    embed_data: embedData,
    bank_code: "",
    description: `Thanh toán lịch hẹn ${transID}`,
  };

  // 🔹 **Tạo chữ ký (MAC) đúng chuẩn ZaloPay**
  const dataToSign = [
    orderData.app_id,
    orderData.app_trans_id,
    orderData.app_user,
    orderData.amount,
    orderData.app_time,
    orderData.embed_data,
    orderData.item,
  ].join("|");

  orderData.mac = crypto
    .createHmac("sha256", zaloPayConfig.key1)
    .update(dataToSign)
    .digest("hex");

  try {
    console.log(
      "🔹 Gửi request tới ZaloPay:",
      JSON.stringify(orderData, null, 2)
    );

    const response = await axios.post(zaloPayConfig.endpoint, orderData, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Response từ ZaloPay:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Lỗi ZaloPay API:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Không thể tạo đơn hàng trên ZaloPay");
  }
}

export { createZaloPayOrder };
