import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify"; // Thay Modal bằng toast
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./checkoutPrice.css";

const CheckOutPrice = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false); // Thêm loading state

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    const username = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      // Lấy dữ liệu giỏ hàng từ localStorage
      const checkoutData = JSON.parse(localStorage.getItem("checkoutCart"));
      if (checkoutData) {
        setCartItems(checkoutData.items);
        setTotalPrice(checkoutData.totalAmount);
      } else {
        // Nếu không có dữ liệu checkout, chuyển về trang shop
        navigate("/pricelist");
      }
    } else {
      navigate("/login");
    }
    document.title = "Thanh toán";
  }, [navigate]);

  const removeFromCart = (index) => {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newCartItems);
    // Cập nhật localStorage
    const username = localStorage.getItem("username");
    const allCartItems = JSON.parse(localStorage.getItem("cartItems")) || {};
    allCartItems[username] = newCartItems;
    localStorage.setItem("cartItems", JSON.stringify(allCartItems));
  };

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      if (userId && accesstoken) {
        await axios.post(
          `http://localhost:8080/user/logout/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );
      }

      localStorage.removeItem("accesstoken");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.", {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  const handleCheckout = async () => {
    // Kiểm tra giỏ hàng trống
    if (cartItems.length === 0) {
      toast.error("Thanh toán thất bại. Giỏ hàng trống!", {
        position: "top-right",
        autoClose: 3000,
        onClose: () => navigate("/pricelist")
      });
      return;
    }

    try {
      // Hiển thị thông báo xác nhận
      if (window.confirm(`Xác nhận thanh toán với tổng tiền: ${totalPrice.toLocaleString()} VNĐ?`)) {
        setLoading(true); // Bắt đầu loading

        // Giả lập thời gian xử lý thanh toán
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Xóa giỏ hàng
        localStorage.removeItem("checkoutCart");
        const username = localStorage.getItem("username");
        const allCartItems = JSON.parse(localStorage.getItem("cartItems")) || {};
        delete allCartItems[username];
        localStorage.setItem("cartItems", JSON.stringify(allCartItems));

        // Hiển thị thông báo thành công
        toast.success("Thanh toán thành công! Cảm ơn bạn đã mua hàng.", {
          position: "top-center",
          autoClose: 2000,
          onClose: () => navigate("/homepage")
        });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Có lỗi xảy ra trong quá trình thanh toán.", {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  return (
    <div className="checkout-page">
      <header className="header-framework">
        <div className="header-content">
          <div className="header-title">
            <Link to="/homepage">
              <h1>Nhật Ký Tiêm Chủng</h1>
            </Link>
          </div>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                <img src="../icons/adminIcon.png" alt="User Avatar" className="avatar-icon" />
              </>
            ) : (
              <button className="login-btn" onClick={() => navigate("/login")}>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="sub-navbar">
        <div className="nav-links">
          <a href="/homepage">Trang chủ</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Tin tức</a>
          <a href="#">Cẩm nang</a>
          <a href="#">Đăng ký tiêm</a>
        </div>
      </nav>

      <div className="checkout-container">
        <h2>Xác nhận đơn hàng</h2>
        <div className="cart-items-list">
          {cartItems.length > 0 ? (
            <>
              <div className="cart-header">
                <span>Sản phẩm</span>
                <span>Số lượng</span>
                <span>Đơn giá</span>
                <span>Thành tiền</span>
                <span>Thao tác</span>
              </div>
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <span>{item.vaccineName}</span>
                  <span>{item.quantity || 1}</span>
                  <span>{item.price}</span>
                  <span>{(parseFloat(item.price) || 0) * (item.quantity || 1)}</span>
                  <button className="delete-btn" onClick={() => removeFromCart(index)}>
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
              <div className="cart-summary">
                <div className="total-amount">
                  <span>Tổng tiền:</span>
                  <span>{totalPrice.toLocaleString()} VNĐ</span>
                </div>
                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Thanh toán"
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="empty-cart">Giỏ hàng trống</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckOutPrice;