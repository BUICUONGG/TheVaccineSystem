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
      
      // Xử lý dữ liệu thông báo
      if (response.data && Array.isArray(response.data)) {
        console.log("Đã nhận được thông báo:", response.data.length);
        console.log("Dữ liệu thông báo:", JSON.stringify(response.data));
        
        if (response.data.length > 0) {
          // Chỉ lấy message và createdAt từ mỗi thông báo
          const simplifiedNotifications = response.data.map(noti => ({
            id: noti._id || 'unknown',
            message: noti.message || 'Không có nội dung',
            createdAt: noti.createdAt || new Date().toLocaleDateString('vi-VN')
          }));
          
          console.log("Thông báo đã xử lý:", simplifiedNotifications);
          
          // Sắp xếp thông báo theo thời gian tạo (mới nhất lên đầu)
          const sortedNotifications = [...simplifiedNotifications].sort((a, b) => {
            // Nếu là định dạng "11/3/2025"
            if (a.createdAt && a.createdAt.includes('/') && b.createdAt && b.createdAt.includes('/')) {
              const partsA = a.createdAt.split('/');
              const partsB = b.createdAt.split('/');
              if (partsA.length === 3 && partsB.length === 3) {
                const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
                const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
                return dateB - dateA;
              }
            }
            // Mặc định sử dụng Date constructor
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          setNotifications(sortedNotifications);
          setUnreadCount(sortedNotifications.length);
          console.log("Đã cập nhật thông báo:", sortedNotifications.length);
        } else {
          console.log("Mảng thông báo rỗng");
          // Tạo một thông báo mặc định khi không có thông báo nào
          const defaultNotification = {
            id: 'default',
            message: "Chào mừng bạn đến với hệ thống thông báo Diary Vaccine",
            createdAt: new Date().toLocaleDateString('vi-VN')
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
          createdAt: new Date().toLocaleDateString('vi-VN')
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
        createdAt: new Date().toLocaleDateString('vi-VN')
      };
      setNotifications([errorNotification]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [cusId]);

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
        createdAt: new Date().toLocaleDateString('vi-VN')
      };
      setNotifications([defaultNotification]);
      setUnreadCount(0); // Không hiển thị badge
    }
  }, [cusId, fetchNotifications]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Xử lý định dạng ngày tháng từ API (có thể là "11/3/2025" hoặc ISO date)
    let date;
    if (dateString.includes('/')) {
      // Nếu là định dạng "11/3/2025"
      const parts = dateString.split('/');
      if (parts.length === 3) {
        date = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return dateString; // Trả về chuỗi gốc nếu không thể parse
    }
    
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    console.log("Đang làm mới thông báo...");
    fetchNotifications();
  };

  const dropdownContent = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Typography.Title level={5} style={{ margin: 0 }}>Thông báo</Typography.Title>
        <Button 
          type="text" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={loading}
          className="refresh-button"
        />
      </div>
      <List
        className="notification-list"
        loading={loading}
        dataSource={notifications}
        locale={{ emptyText: <Empty description="Không có thông báo nào" /> }}
        renderItem={(item) => (
          <List.Item className="notification-item">
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
