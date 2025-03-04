import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, message } from 'antd';
import { UserOutlined, HistoryOutlined, KeyOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import "./Profile.css";

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

      const tokenParts = accesstoken.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      const response = await axios.get(
        `http://localhost:8080/customer/getOneCustomer/${userId}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` }
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
    if (path === '/homepage') return 'home';
    if (path.includes('/profile/history')) return 'history';
    if (path.includes('/profile/account')) return 'account';
    return 'profile';
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
      onClick: () => navigate('/homepage')
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile')
    },
    {
      key: 'account',
      icon: <KeyOutlined />,
      label: 'Thông tin tài khoản',
      onClick: () => navigate('/profile/account')
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'Lịch sử tiêm chủng',
      onClick: () => navigate('/profile/history')
    } 
  ];

  return (
    <Layout className="profile-layout">
      <Sider className="profile-sider" width={280}>
        <div className="profile-menu-header">
          <div className="user-info">
            <h3>{userData?.customerName || 'Người dùng'}</h3>
            <p>{userData?.email || 'Email chưa cập nhật'}</p>
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
