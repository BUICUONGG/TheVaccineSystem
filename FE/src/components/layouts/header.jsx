import { useState, useEffect } from "react";
import { Avatar, Dropdown, Menu, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, LogoutOutlined, DownOutlined, CommentOutlined } from "@ant-design/icons";
import NotificationIcon from "../../pages/homepage/notification/Notification";
// import "./header.css";
function HeaderLayouts({ footerRef }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [cusId, setCusId] = useState(null);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
      try {
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const role = payload.role;
        setUserRole(role);
        
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        }
        
        if (role === "customer") {
          const storedCusId = localStorage.getItem("cusId");
          if (storedCusId) {
            setCusId(storedCusId);
          }
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }

    // Add scroll event listener
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) { // Only apply behavior after scrolling past 100px
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide nav
          setNavVisible(false);
        } else {
          // Scrolling up - show nav
          setNavVisible(true);
        }
      } else {
        // Always show nav at the top of the page
        setNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/thank-you");
  };

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openFeedbackForm = () => {
    if (isLoggedIn && userRole === "customer") {
      setShowFeedbackForm(true);
    } else {
      navigate("/login");
    }
  };

  const getUserMenuItems = () => {
    if (userRole === "admin") {
      return (
        <Menu>
          <Menu.Item key="admin" icon={<UserOutlined />}>
            <Link to="/admin">Admin</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      );
    } else if (userRole === "staff") {
      return (
        <Menu>
          <Menu.Item key="staff" icon={<UserOutlined />}>
            <Link to="/staffLayout">Quản lý KH</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            <Link to="/profile">Hồ sơ cá nhân</Link>
          </Menu.Item>
          <Menu.Item key="feedback" icon={<CommentOutlined />} onClick={openFeedbackForm}>
            Đánh giá
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      );
    }
  };

  const navStyle = {
    position: 'fixed',
    top: navVisible ? '0' : '-80px', // Adjust this value based on your nav height
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'top 0.3s ease-in-out',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  return (
    <nav style={navStyle}>
      <div className="logo">
        <Link to="/homepage">
          <img src="/images/LogoHeader.png" alt="Logo" className="logo-image" />
          Diary Vaccine
        </Link>
      </div>
      <ul>
        <li>
          <Link to="/homepage">Trang chủ</Link>
        </li>
        <li>
          <Link to="/blogs">Blog</Link>
        </li>
        <li>
          <Link to="/news">Tin tức</Link>
        </li>
        <li>
          <Link to="#" onClick={scrollToFooter}>
            Liên hệ
          </Link>
        </li>
        {!isLoggedIn ? (
          <>
            <li>
              <Link to="/login">Đăng Nhập</Link>
            </li>
            <li>
              <Link to="/register">Đăng Ký</Link>
            </li>
          </>
        ) : (
          <>
            {userRole === "customer" && cusId && (
              <li className="notification-container">
                <NotificationIcon cusId={cusId} />
              </li>
            )}
            <li className="user-dropdown">
              <Dropdown overlay={getUserMenuItems()} trigger={['click']}>
                <a onClick={(e) => e.preventDefault()}>
                  <Space>
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: userRole === 'admin' ? '#ff4d4f' : userRole === 'staff' ? '#1890ff' : '#52c41a' }} 
                    />
                    <span className="username">{username}</span>
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default HeaderLayouts;