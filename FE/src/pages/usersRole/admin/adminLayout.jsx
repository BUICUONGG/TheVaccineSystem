import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "./adminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem("accesstoken");
    document.title = "Quản trị viên";
    if (!accessToken) {
      navigate("/login");
      return;
    }
    try {
      const tokenParts = accessToken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      if (payload.role !== "admin") {
        navigate("/homepage");
        return;
      }

      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
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

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo-container">
          <img src="/images/LogoHeader.png" alt="Diary Vaccine Logo" className="admin-logo" />
          <h2 className="admin-project-name">Diary Vaccine</h2>
        </div>
        <div className="admin-sidebar-info">
          <div className="admin-sidebar-icon"></div>
          <span className="admin-sidebar-name">{username}</span>
        </div>
        <ul className="admin-menu">
          <li className="admin-menu-item">
            <Link to="/admin"
              className={
                location.pathname === "/admin" && !location.pathname.includes("/admin/") ? "active" : ""
              }
            >Thống kê
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link to="/staffLayout/appointments"
              className={
                location.pathname === "/admin/appointments" ? "active" : ""
              }
            >Lịch Hẹn
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link to="/admin/vaccines"
              className={
                location.pathname === "/admin/vaccines" ? "active" : ""
              }
            >Vaccines
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link to="/admin/accounts"
              className={
                location.pathname === "/admin/accounts" ? "active" : ""
              }
            >Tài khoản
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link to="/admin/staffs"
              className={
                location.pathname === "/admin/staffs" ? "active" : ""
              }
            >Nhân Viên
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/customers"
              className={
                location.pathname === "/admin/customers" ? "active" : ""
              }
            >Khách Hàng
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/blogManagement"
              className={location.pathname === "/admin/blogManagement" ? "active" : ""}
            >Cẩm nang
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/newsManagement"
              className={location.pathname === "/admin/newsManagement" ? "active" : ""}
            >Tin Tức
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/feedback"
              className={
                location.pathname === "/admin/feedback" ? "active" : ""
              }
            >Đánh giá
            </Link>
          </li>
        </ul>
        <div className="admin-logout">
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="admin-logout-btn"
          >Đăng xuất
          </Button>
        </div>
      </div>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-nav">
            <Link to="/homepage" className="admin-nav-link">Trang chủ</Link>
          </div>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;