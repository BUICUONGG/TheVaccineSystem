import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { Link } from 'react-router-dom';
import "./homePage.css"; // Reuse the same CSS file

const NewPage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    // ...existing code...
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, []);

  return (
    <div className={`newpage ${isDarkMode ? "dark-mode" : ""}`}>
      <header className="header-framework">
        <div className="header-content">
          <div className="header-title">
            <h1>Nhật Ký Tiêm Chủng</h1>
            <div className="header-subtitle">
              AN TOÀN - UY TÍN - CHẤT LƯỢNG HÀNG ĐẦU VIỆT NAM
            </div>
          </div>
          
          <div className="auth-buttons">
            <FaShoppingCart className="cart-icon" />
            {isLoggedIn ? (
              <>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
                <img
                  src="../icons/adminIcon.png"
                  alt="User Avatar"
                  className="avatar-icon"
                />
              </>
            ) : (
              <>
                <button className="login-btn" onClick={handleLogin}>
                  Đăng nhập
                </button>
                <button className="register-btn" onClick={handleRegister}>
                  Đăng ký
                </button>
              </>
            )}
            <button
              className={`theme-toggle-btn ${isDarkMode ? "dark" : ""}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            />
          </div>
        </div>
      </header>
      {/* Add your new page content here */}
    </div>
  );
};

export default NewPage;
