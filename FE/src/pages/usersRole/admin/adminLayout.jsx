import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import "./adminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    // Kiểm tra authentication và authorization
    const accessToken = localStorage.getItem("accesstoken");
    document.title = "Quản trị viên";
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      // Decode token để kiểm tra role
      const tokenParts = accessToken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      if (payload.role !== "admin") {
        navigate("/homepage");
        return;
      }

      // Nếu là admin, set tên admin
      const username = localStorage.getItem("username");
      if (username) {
        setAdminName(`Admin: ${username}`);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    // Xóa tất cả thông tin người dùng khỏi localStorage
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");

    // Điều hướng đến trang Thank
    navigate("/thank-you");
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-info">
          <div className="admin-sidebar-icon">👤</div>
          <span className="admin-sidebar-name">{adminName}</span>
        </div>

        <ul className="admin-menu">
          <li className="admin-menu-item">
            <Link
              to="/admin"
              className={
                location.pathname === "/admin" &&
                !location.pathname.includes("/admin/")
                  ? "active"
                  : ""
              }
            >
              Dashboard
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/accounts"
              className={
                location.pathname === "/admin/accounts" ? "active" : ""
              }
            >
              Accounts
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/customers"
              className={
                location.pathname === "/admin/customers" ? "active" : ""
              }
            >
              Customers
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/blog"
              className={location.pathname === "/admin/blog" ? "active" : ""}
            >
              Blog
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/newsManagement"
              className={location.pathname === "/admin/newsManagement" ? "active" : ""}
            >
              News
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/vaccines"
              className={
                location.pathname === "/admin/vaccines" ? "active" : ""
              }
            >
              Vaccines
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/staffLayout/appointments"
              className={
                location.pathname === "/admin/appointments" ? "active" : ""
              }
            >
              Appointments
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link
              to="/admin/feedback"
              className={
                location.pathname === "/admin/feedback" ? "active" : ""
              }
            >
              Feedback
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
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-nav">
            <Link to="/homepage" className="admin-nav-link">
              Home
            </Link>
            <span className="admin-nav-link">Contact</span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
