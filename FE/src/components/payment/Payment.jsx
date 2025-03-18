import { useState } from "react";
import axios from "axios";
import "./Payment.css";

export default function PaymentPage() {
  const [order] = useState({
    customerName: "Nguyễn Văn A",
    price: 500000,
    orderId: "ORD123456",
    email: "example@email.com",
    phone: "0123456789",
    items: [
      { name: "Vaccine A", quantity: 1, price: 300000 },
      { name: "Vaccine B", quantity: 1, price: 200000 },
    ],
  });

  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  const handlePayment = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/payment", {
        price: order.price,
        cusName: order.customerName,
        orderId: order.orderId,
        paymentMethod: paymentMethod,
      });

      if (response.data.order_url) {
        window.location.href = response.data.order_url;
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error.message);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Chi tiết thanh toán</h2>
          <p className="order-id">Mã đơn hàng: {order.orderId}</p>
        </div>

        <div className="customer-info">
          <h3>Thông tin khách hàng</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Họ và tên</label>
              <p>{order.customerName}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{order.email}</p>
            </div>
            <div className="info-item">
              <label>Số điện thoại</label>
              <p>{order.phone}</p>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h3>Chi tiết đơn hàng</h3>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
                <span>{item.price.toLocaleString()} VND</span>
              </div>
            ))}
          </div>
          <div className="total-amount">
            <span>Tổng tiền</span>
            <span>{order.price.toLocaleString()} VND</span>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Phương thức thanh toán</h3>
          <div className="method-options">
            <label className={`method-option ${paymentMethod === 'vnpay' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="vnpay"
                checked={paymentMethod === 'vnpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <img src="/vnpay-logo.png" alt="VNPay" />
              <span>VNPay</span>
            </label>
            <label className={`method-option ${paymentMethod === 'zalopay' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="zalopay"
                checked={paymentMethod === 'zalopay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <img src="/zalopay-logo.png" alt="ZaloPay" />
              <span>ZaloPay</span>
            </label>
          </div>
        </div>

        <button onClick={handlePayment} className="payment-button">
          Thanh toán ngay
        </button>
      </div>
    </div>
  );
}
