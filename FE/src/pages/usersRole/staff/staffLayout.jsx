import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined, RollbackOutlined } from "@ant-design/icons";
import "./staffLayout.css";

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffName, setStaffName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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

      if (payload.role !== "staff" && payload.role !== "admin") {
        navigate("/homepage");
        return;
      }

      // Kiểm tra nếu là admin
      if (payload.role === "admin") {
        setIsAdmin(true);
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
    localStorage.clear();
    navigate("/thank-you");
  };

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  return (
    <div className="staff-layout">
      <div className="staff-sidebar">
        <div className="staff-sidebar-info">
          <div className="staff-sidebar-icon"></div>
          <span className="staff-sidebar-name">{staffName}</span>
        </div>

        <ul className="staff-menu">
          <li className="staff-menu-item">
            <Link
              to="/staffLayout/appointments"
              className={location.pathname === "/staffLayout/appointments" ? "active" : ""}
            >
              Quản lý lịch hẹn
            </Link>
          </li>
          <li className="staff-menu-item">
            <Link
              to="/staffLayout/customers"
              className={location.pathname === "/staffLayout/customers" ? "active" : ""}
            >
              Khách hàng
            </Link>
          </li>
        </ul>

        <div className="staff-logout">
          {isAdmin && (
            <Button
              type="primary"
              icon={<RollbackOutlined />}
              onClick={handleBackToAdmin}
              className="staff-back-to-admin-btn"
              style={{ marginBottom: '10px' }}
            >
              Quay về trang Admin
            </Button>
          )}
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="staff-logout-btn"
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="staff-main">
        <header className="staff-header">
          <div className="staff-nav">
            <Link to="/homepage" className="staff-nav-link">
              Trang chủ
            </Link>
          </div>
        </header>
        <main className="staff-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
