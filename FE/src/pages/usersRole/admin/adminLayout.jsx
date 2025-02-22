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
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="admin-info">
          <div className="admin-icon">👤</div>
          <span className="admin-name">{adminName}</span>
        </div>

        <ul className="menu-items">
          <li className="menu-item">
            <Link
              to="/admin/overview"
              className={
                location.pathname === "/admin/overview" ? "active" : ""
              }
            >
              Overview
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/admin/accounts"
              className={
                location.pathname === "/admin/accounts" ? "active" : ""
              }
            >
              Accounts
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/admin/customers"
              className={
                location.pathname === "/admin/customers" ? "active" : ""
              }
            >
              Customers
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/admin/blog"
              className={location.pathname === "/admin/blog" ? "active" : ""}
            >
              Blog
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/admin/vaccines"
              className={
                location.pathname === "/admin/vaccines" ? "active" : ""
              }
            >
              Vaccines
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/admin/feedback"
              className={
                location.pathname === "/admin/feedback" ? "active" : ""
              }
            >
              Feedback
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/admin/appointments"
              className={
                location.pathname === "/admin/appointments" ? "active" : ""
              }
            >
              Appointments
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to="/admin/consultations"
              className={
                location.pathname === "/admin/consultations" ? "active" : ""
              }
            >
              Consultations
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
            Logout
          </Button>
        </div>
      </div>

      <div className="main-contentt">
        <header className="header">
          <nav className="navigation">
            <Link to="/homepage">
              <span className="nav-item">Home</span>
            </Link>
            <span className="nav-item">Contact</span>
          </nav>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
