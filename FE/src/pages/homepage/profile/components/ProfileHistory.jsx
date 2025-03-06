import { useState, useEffect } from 'react';
import { Table, Tag, Spin, message, Tabs, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import './ProfileHistory.css';

const { TabPane } = Tabs;

const ProfileHistory = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const tokenParts = accesstoken.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const cusId = payload.id;

      const response = await axios.get(
        `http://localhost:8080/appointmentLe/getdetailaptlee/${cusId}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` }
        }
      );
      console.log(response.data);
      setAppointments(response.data);
    } catch (error) {
      message.error('Không thể tải lịch sử đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#52c41a"; // Xanh lá
      case "incomplete":
        return "#ff4d4f"; // Đỏ
      case "pending":
        return "#faad14"; // Vàng
      case "approve":
        return "#1890ff"; // Xanh dương
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "HOÀN THÀNH";
      case "incomplete":
        return "CHƯA HOÀN THÀNH";
      case "pending":
        return "ĐANG CHỜ";
      case "approve":
        return "ĐÃ DUYỆT";
      default:
        return "KHÔNG XÁC ĐỊNH";
    }
  };

  const columns = [
    {
      title: 'Ngày đặt',
      dataIndex: 'createAt',
      key: 'createAt',
      width: '15%'
    },
    {
      title: 'Loại vaccine',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      render: (type) => (type === 'single' ? 'Vaccine lẻ' : 'Gói vaccine')
    },
    {
      title: 'Tên vaccine/Gói',
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      width: '25%'
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'date',
      key: 'date',
      width: '15%'
    },
    {
      title: 'Giá tiền',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      render: (price) => `${price.toLocaleString()} VNĐ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="status-tag">
          {getStatusText(status)}
        </Tag>
      )
    }
  ];

  const getFilteredAppointments = (status) => {
    return appointments.filter(appointment => {
      // First filter by status if specified
      if (status && appointment.status.toLowerCase() !== status) {
        return false;
      }

      // Then filter by search text
      const searchLower = searchText.toLowerCase();
      const vaccineName = appointment.vaccineName?.toLowerCase() || '';
      const customerName = appointment.customerName?.toLowerCase() || '';
      const date = appointment.date?.toLowerCase() || '';

      return vaccineName.includes(searchLower) ||
             customerName.includes(searchLower) ||
             date.includes(searchLower);
    });
  };

  const renderTable = (appointments) => (
    <Table
      columns={columns}
      dataSource={appointments}
      rowKey="_id"
      pagination={{
        pageSize: 7,
        position: ['bottomCenter'],
        showSizeChanger: false
      }}
      className="history-table"
    />
  );

  return (
    <div className="history-container">
      <div className="content-header">
        <h2>Lịch Sử Tiêm Chủng</h2>
        <p>Xem lịch sử đặt lịch và trạng thái tiêm chủng của bạn</p>
      </div>

      <div className="search-section">
        <Input
          placeholder="Tìm kiếm theo tên vaccine, người tiêm hoặc ngày tiêm..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
          allowClear
        />
      </div>

      <div className="table-container">
        <Spin spinning={loading}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="custom-tabs"
            type="card"
          >
            <TabPane 
              tab={
                <span className="tab-label">
                  Đang chờ duyệt
                  {getFilteredAppointments('pending').length > 0 && (
                    <Tag color="#faad14" className="tab-count">
                      {getFilteredAppointments('pending').length}
                    </Tag>
                  )}
                </span>
              } 
              key="pending"
            >
              {renderTable(getFilteredAppointments('pending'))}
            </TabPane>
            <TabPane 
              tab={<span className="tab-label">Tất cả lịch hẹn</span>} 
              key="all"
            >
              {renderTable(getFilteredAppointments())}
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    </div>
  );
};

export default ProfileHistory;
