import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import "./staffLayout.css";

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    // Kiểm tra authentication và authorization
    const accessToken = localStorage.getItem("accesstoken");
    document.title = "Nhân viên";
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      // Decode token để kiểm tra role
      const tokenParts = accessToken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      if (payload.role !== "staff") {
        navigate("/homepage");
        return;
      }

      // Nếu là staff, set tên staff
      const username = localStorage.getItem("username");
      if (username) {
        setStaffName(`Nhân viên: ${username}`);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    // Xóa tất cả thông tin người dùng khỏi localStorage
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Điều hướng đến trang Thank
    navigate('/thank-you');
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="staff-info">
          <div className="staff-icon">👤</div>
          <span className="staff-name">{staffName}</span>
        </div>

        <ul className="menu-items">
          <li className="menu-item">
            <Link
              to="/staffLayout/overview"
              className={
                location.pathname === "/staffLayout/overview" ? "active" : ""
              }
            >
              Tổng quan
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/staffLayout/appointments"
              className={
                location.pathname === "/staffLayout/appointments" ? "active" : ""
              }
            >
              Quản lý lịch hẹn
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/staffLayout/customers"
              className={
                location.pathname === "/staffLayout/customers" ? "active" : ""
              }
            >
              Khách hàng
            </Link>
          </li>
        </ul>

        <div className="logout-section">
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="logout-button"
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="main-content">
        <header className="header">
          <nav className="navigation">
            <Link to="/homepage">
              <span className="nav-item">Trang chủ</span>
            </Link>
            <span className="nav-item">Liên hệ</span>
          </nav>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
