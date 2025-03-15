import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import { Layout, Menu, message } from "antd";
import {
  UserOutlined,
  HistoryOutlined,
  KeyOutlined,
  HomeOutlined,
} from "@ant-design/icons";
// import axios from "axios";
import "./Profile.css";
import axiosInstance from "../../../service/api";

const { Sider, Content } = Layout;

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      if (!accesstoken) {
        message.error("Vui lòng đăng nhập để xem thông tin");
        navigate("/login");
        return;
      }

      const tokenParts = accesstoken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      const response = await axiosInstance.get(
        `/customer/getOneCustomer/${userId}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [location.pathname]);

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/homepage") return "home";
    if (path.includes("/profile/history")) return "history";
    if (path.includes("/profile/account")) return "account";
    return "profile";
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Trang chủ",
      onClick: () => navigate("/homepage"),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "account",
      icon: <KeyOutlined />,
      label: "Thông tin tài khoản",
      onClick: () => navigate("/profile/account"),
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử tiêm chủng",
      onClick: () => navigate("/profile/history"),
    },
  ];

  return (
    <Layout className="profile-layout">
      <Sider className="profile-sider" width={280}>
        <div className="profile-menu-header">
          <div className="logo">
            <Link to="/homepage">
              <div className="logo-icon">
                <img src="/images/LogoHeader.png" alt="Logo" />
              </div>
              <div className="logo-text">
                <span className="diary">Diary</span>
                <span className="vaccine">Vaccine</span>
              </div>
            </Link>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className="profile-menu"
        />
      </Sider>
      <Content className="profile-content">
        <Outlet context={{ userData, refreshUserData: fetchUserData }} />
      </Content>
    </Layout>
  );
};

export default Profile;
