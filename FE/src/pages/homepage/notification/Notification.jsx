import { useEffect, useState } from 'react';
import { Badge, Dropdown, Space, List, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axiosInstance from "../../../service/api";
import './Notification.css';

const NotificationIcon = ({ cusId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get(`/noti/getNotiByCusId/${cusId}`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => n.status === "unread").length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (cusId) {
      fetchNotifications();
      // Polling every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [cusId]);

  const dropdownContent = (
    <div className="notification-dropdown">
      <List
        className="notification-list"
        header={<div className="notification-header">Thông báo</div>}
        dataSource={notifications}
        locale={{ emptyText: "Không có thông báo nào" }}
        renderItem={(item) => (
          <List.Item className={`notification-item ${item.status === "unread" ? "unread" : ""}`}>
            <Typography.Text>{item.message}</Typography.Text>
            <Typography.Text className="notification-time">
              {new Date(item.createdAt).toLocaleString()}
            </Typography.Text>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown 
      overlay={dropdownContent} 
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="notification-dropdown-overlay"
    >
      <Space className="notification-trigger">
        <Badge count={unreadCount} overflowCount={99}>
          <BellOutlined className="notification-bell" />
        </Badge>
      </Space>
    </Dropdown>
  );
};

export default NotificationIcon;
