import { useEffect, useState } from 'react';
import { Badge, Dropdown, Space, List, Typography, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axiosInstance from "../../../service/api";
import './Notification.css';

const NotificationIcon = ({ cusId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!cusId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/noti/getNotiByCusId/${cusId}`);
      if (response.data) {
        setNotifications(response.data);
        // Assuming all notifications are unread for now
        setUnreadCount(response.data.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const dropdownContent = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Typography.Title level={5} style={{ margin: 0 }}>Thông báo</Typography.Title>
      </div>
      <List
        className="notification-list"
        loading={loading}
        dataSource={notifications}
        locale={{ emptyText: <Empty description="Không có thông báo nào" /> }}
        renderItem={(item) => (
          <List.Item className={`notification-item ${item.status === "unread" ? "unread" : ""}`}>
            <div>
              <Typography.Text strong>{item.message}</Typography.Text>
              <div className="notification-time">
                {formatDate(item.createdAt)}
              </div>
            </div>
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
