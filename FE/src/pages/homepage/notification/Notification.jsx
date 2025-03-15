import { useEffect, useState, useCallback } from 'react';
import { Badge, Dropdown, Space, List, Typography, Empty, Button } from 'antd';
import { BellOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosInstance from "../../../service/api";
import './Notification.css';

const NotificationIcon = ({ cusId: propsCusId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cusId, setCusId] = useState(propsCusId);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Lấy cusId từ localStorage nếu không có từ props
  useEffect(() => {
    if (!propsCusId) {
      const storedCusId = localStorage.getItem("cusId");
      if (storedCusId) {
        console.log("Sử dụng cusId từ localStorage:", storedCusId);
        setCusId(storedCusId);
      }
    } else {
      setCusId(propsCusId);
    }
  }, [propsCusId]);

  // Hàm để lấy danh sách thông báo đã đọc từ localStorage
  const getReadNotifications = useCallback(() => {
    try {
      const readNotificationsStr = localStorage.getItem(`readNotifications_${cusId}`);
      return readNotificationsStr ? JSON.parse(readNotificationsStr) : [];
    } catch (error) {
      console.error("Lỗi khi đọc thông báo đã đọc từ localStorage:", error);
      return [];
    }
  }, [cusId]);

  // Hàm để lưu danh sách thông báo đã đọc vào localStorage
  const saveReadNotifications = useCallback((notificationIds) => {
    try {
      localStorage.setItem(`readNotifications_${cusId}`, JSON.stringify(notificationIds));
    } catch (error) {
      console.error("Lỗi khi lưu thông báo đã đọc vào localStorage:", error);
    }
  }, [cusId]);

  // Sử dụng useCallback để tránh tạo lại hàm fetchNotifications mỗi khi component re-render
  const fetchNotifications = useCallback(async () => {
    if (!cusId) {
      console.log("Không có cusId, không thể lấy thông báo");
      return;
    }
    
    console.log("Bắt đầu lấy thông báo với cusId:", cusId);
    setLoading(true);
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      if (!accesstoken) {
        console.log("Không có accesstoken, không thể lấy thông báo");
        return;
      }
      
      // Gọi API với đúng định dạng URL
      console.log("URL API:", `/noti/getNotiByCusId/${cusId}`);
      const response = await axiosInstance.get(`/noti/getNotiByCusId/${cusId}`, {
        headers: { Authorization: `Bearer ${accesstoken}` },
      });
      
      console.log("Kết quả API thông báo:", response);
      
      // Lấy danh sách ID thông báo đã đọc từ localStorage
      const readNotificationIds = getReadNotifications();
      
      // Xử lý dữ liệu thông báo
      if (response.data && Array.isArray(response.data)) {
        console.log("Đã nhận được thông báo:", response.data.length);
        console.log("Dữ liệu thông báo:", JSON.stringify(response.data));
        
        if (response.data.length > 0) {
          // Chỉ lấy message và id từ mỗi thông báo, kiểm tra trạng thái đã đọc từ localStorage
          const simplifiedNotifications = response.data.map(noti => ({
            id: noti._id || 'unknown',
            message: noti.message || 'Không có nội dung',
            read: readNotificationIds.includes(noti._id), // Kiểm tra xem thông báo đã được đọc chưa
            createdAt: noti.createdAt || new Date().toISOString() // Lấy thời gian tạo thông báo
          }));
          
          // Sắp xếp thông báo theo thời gian tạo (mới nhất lên đầu)
          const sortedNotifications = simplifiedNotifications.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          // Lọc ra các thông báo chưa đọc
          const unreadNotifications = sortedNotifications.filter(noti => !noti.read);
          
          console.log("Thông báo đã xử lý và sắp xếp:", sortedNotifications);
          console.log("Thông báo chưa đọc:", unreadNotifications.length);
          
          setNotifications(sortedNotifications);
          setUnreadCount(unreadNotifications.length);
          console.log("Đã cập nhật thông báo:", sortedNotifications.length);
        } else {
          console.log("Mảng thông báo rỗng");
          // Tạo một thông báo mặc định khi không có thông báo nào
          const defaultNotification = {
            id: 'default',
            message: "Chào mừng bạn đến với hệ thống thông báo Diary Vaccine",
            read: true
          };
          setNotifications([defaultNotification]);
          setUnreadCount(0); // Không hiển thị badge khi chỉ có thông báo mặc định
        }
      } else {
        console.log("Không có dữ liệu thông báo hoặc dữ liệu không phải mảng");
        console.log("Dữ liệu nhận được:", response.data);
        // Tạo một thông báo mặc định khi không có thông báo nào
        const defaultNotification = {
          id: 'default',
          message: "Chào mừng bạn đến với hệ thống thông báo Diary Vaccine",
          read: true
        };
        setNotifications([defaultNotification]);
        setUnreadCount(0); // Không hiển thị badge khi chỉ có thông báo mặc định
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
        console.error("Mã lỗi:", error.response.status);
      } else {
        console.error("Lỗi không có response:", error.message);
      }
      // Tạo một thông báo lỗi
      const errorNotification = {
        id: 'error',
        message: "Không thể kết nối đến hệ thống thông báo. Vui lòng thử lại sau.",
        read: true
      };
      setNotifications([errorNotification]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [cusId, getReadNotifications]);

  // Gọi API khi component mount hoặc cusId thay đổi
  useEffect(() => {
    console.log("useEffect chạy với cusId:", cusId);
    if (cusId) {
      console.log("Component mounted với cusId:", cusId);
      fetchNotifications();
      
      // Polling mỗi 30 giây
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      console.log("Không có cusId trong useEffect");
      // Nếu không có cusId, hiển thị thông báo mặc định
      const defaultNotification = {
        id: 'default',
        message: "Vui lòng đăng nhập để xem thông báo",
        read: true
      };
      setNotifications([defaultNotification]);
      setUnreadCount(0); // Không hiển thị badge
    }
  }, [cusId, fetchNotifications]);

  const handleRefresh = () => {
    console.log("Đang làm mới thông báo...");
    fetchNotifications();
  };

  // Xử lý khi click vào thông báo
  const handleNotificationClick = (id) => {
    if (id === 'default' || id === 'error') return; // Không xử lý cho thông báo mặc định hoặc lỗi
    
    // Đánh dấu thông báo đã đọc
    const updatedNotifications = notifications.map(noti => 
      noti.id === id ? { ...noti, read: true } : noti
    );
    setNotifications(updatedNotifications);
    
    // Cập nhật số lượng thông báo chưa đọc
    const unreadNotifications = updatedNotifications.filter(noti => !noti.read);
    setUnreadCount(unreadNotifications.length);
    
    // Lưu ID thông báo đã đọc vào localStorage
    const readNotificationIds = getReadNotifications();
    if (!readNotificationIds.includes(id)) {
      readNotificationIds.push(id);
      saveReadNotifications(readNotificationIds);
    }
  };

  // Xử lý khi mở/đóng dropdown
  const handleDropdownVisibleChange = (visible) => {
    setIsDropdownVisible(visible);
    
    // Nếu đóng dropdown, đánh dấu tất cả thông báo đã đọc
    if (!visible && notifications.some(noti => !noti.read)) {
      const allReadNotifications = notifications.map(noti => ({ ...noti, read: true }));
      setNotifications(allReadNotifications);
      setUnreadCount(0);
      
      // Lưu tất cả ID thông báo vào localStorage
      const readNotificationIds = getReadNotifications();
      const newReadIds = notifications
        .filter(noti => !noti.read && noti.id !== 'default' && noti.id !== 'error')
        .map(noti => noti.id);
      
      if (newReadIds.length > 0) {
        const updatedReadIds = [...new Set([...readNotificationIds, ...newReadIds])];
        saveReadNotifications(updatedReadIds);
      }
    }
  };

  // Xử lý đánh dấu tất cả thông báo đã đọc
  const handleMarkAllAsRead = () => {
    if (notifications.length === 0 || notifications.every(noti => noti.read)) return;
    
    // Đánh dấu tất cả thông báo đã đọc
    const allReadNotifications = notifications.map(noti => ({ ...noti, read: true }));
    setNotifications(allReadNotifications);
    setUnreadCount(0);
    
    // Lưu tất cả ID thông báo vào localStorage
    const readNotificationIds = getReadNotifications();
    const newReadIds = notifications
      .filter(noti => !noti.read && noti.id !== 'default' && noti.id !== 'error')
      .map(noti => noti.id);
    
    if (newReadIds.length > 0) {
      const updatedReadIds = [...new Set([...readNotificationIds, ...newReadIds])];
      saveReadNotifications(updatedReadIds);
    }
  };

  const dropdownContent = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Typography.Title level={5} style={{ margin: 0 }}>Thông báo</Typography.Title>
        <div className="notification-actions">
          <Button 
            type="text" 
            size="small"
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0 || notifications.every(noti => noti.read)}
          >
            Đánh dấu đã đọc tất cả
          </Button>
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
            className="refresh-button"
          />
        </div>
      </div>
      <List
        className="notification-list"
        loading={loading}
        dataSource={notifications}
        locale={{ emptyText: <Empty description="Không có thông báo nào" /> }}
        renderItem={(item) => (
          <List.Item 
            className={`notification-item ${item.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(item.id)}
          >
            <div className="notification-content">
              <Typography.Text strong={!item.read}>{item.message}</Typography.Text>
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
      onVisibleChange={handleDropdownVisibleChange}
      visible={isDropdownVisible}
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
