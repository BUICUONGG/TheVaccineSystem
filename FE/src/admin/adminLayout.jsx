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
    const username = localStorage.getItem("username");
    if (username) {
      setAdminName(`Admin: ${username}`);
    }
  }, []);

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
              className={location.pathname === "/admin/overview" ? "active" : ""}
            >
              Overview
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              to="/admin/accounts"
              className={location.pathname === "/admin/accounts" ? "active" : ""}
            >
              Accounts
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              to="/admin/vaccines"
              className={location.pathname === "/admin/vaccines" ? "active" : ""}
            >
              Vaccines
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              to="/admin/feedback"
              className={location.pathname === "/admin/feedback" ? "active" : ""}
            >
              Feedback
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              to="/admin/appointments"
              className={location.pathname === "/admin/appointments" ? "active" : ""}
            >
              Appointments
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              to="/admin/consultations"
              className={location.pathname === "/admin/consultations" ? "active" : ""}
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

      <div className="main-content">
        <header className="header">
          <nav className="navigation">
            <span className="nav-item">Home</span>
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
