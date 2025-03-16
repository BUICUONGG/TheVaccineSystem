import { useState } from "react";
import axios from "axios";

export default function PaymentPage() {
  const [order] = useState({
    customerName: "Nguyễn Văn A",
    price: 500000,
    orderId: "ORD123456",
  });

  const handlePayment = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/payment", {
        price: order.price,
        cusName: order.customerName,
        orderId: order.orderId,
      });

      if (response.data.order_url) {
        window.location.href = response.data.order_url; // Chuyển đến trang thanh toán VNPay/ZaloPay
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Thanh toán đơn hàng</h2>
      <p className="text-gray-700">
        Tên khách hàng: <strong>{order.customerName}</strong>
      </p>
      <p className="text-gray-700">
        Mã đơn hàng: <strong>{order.orderId}</strong>
      </p>
      <p className="text-gray-700">
        Số tiền: <strong>{order.price.toLocaleString()} VND</strong>
      </p>
      <button
        onClick={handlePayment}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Thanh toán
      </button>
    </div>
  );
}
