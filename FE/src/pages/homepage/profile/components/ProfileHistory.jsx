import { useState, useEffect } from 'react';
import { Table, Tag, Input, Modal, Button, Tabs, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import './ProfileHistory.css';
import { toast } from 'react-toastify';
import axiosInstance from '../../../../service/api';

const { TabPane } = Tabs;

const ProfileHistory = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [vaccineList, setVaccineList] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchAppointments();
    fetchVaccineList();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const cusId = localStorage.getItem("cusId");   

      const response = await axiosInstance.post(
        `http://localhost:8080/customer/getAptleAndAptGoiByCusId/${cusId}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` }
        }
      );

      const aptLes = (response.data.aptLes || []).map(apt => ({
        ...apt,
        type: 'Tiêm lẻ'
      }));

      const aptGois = (response.data.aptGois || []).map(apt => ({
        ...apt,
        type: 'Tiêm gói'
      }));

      const allAppointments = [...aptLes, ...aptGois];
      setAppointments(allAppointments);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error('Không thể tải lịch sử đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccineList = async () => {
    try {
      const response = await axiosInstance.get('/vaccine/showInfo');
      if (response.data) {
        const vaccineMap = {};
        response.data.forEach(vaccine => {
          vaccineMap[vaccine._id] = vaccine.vaccineName;
        });
        setVaccineList(vaccineMap);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vaccine:", error);
    }
  };

  // const fetchVaccineInfo = async (vaccineId) => {
  //   try {
  //     const response = await axiosInstance.get(`/vaccine/get/${vaccineId}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Lỗi khi lấy thông tin vaccine:", error);
  //     return null;
  //   }
  // };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "#52c41a";
      case "incomplete": return "#ff4d4f";
      case "pending": return "#faad14";
      case "approve": return "#1890ff";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "HOÀN THÀNH";
      case "incomplete": return "CHƯA HOÀN THÀNH";
      case "pending": return "ĐANG CHỜ";
      case "approve": return "ĐÃ DUYỆT";
      default: return "KHÔNG XÁC ĐỊNH";
    }
  };

  const showModal = (record) => {
    setSelectedAppointment(record);
    setIsModalVisible(true);
  };

  const getFilteredAppointments = (tabKey) => {
    // Sắp xếp tất cả các đơn theo ngày đăng ký (sớm nhất lên đầu)
    let filtered = [...appointments].sort((a, b) => {
      // Chuyển đổi định dạng ngày từ DD/MM/YYYY sang Date object
      const [dayA, monthA, yearA] = a.createdAt.split('/');
      const [dayB, monthB, yearB] = b.createdAt.split('/');
      
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      
      return dateB - dateA; // Sắp xếp để ngày sớm hơn hiển thị trước
    });
    
    // Lọc theo tab
    if (tabKey === 'pending') {
      filtered = filtered.filter(apt => apt.status?.toLowerCase() === 'pending');
    }

    // Lọc theo search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(apt => {
        const name = !apt.child ? apt.customer?.customerName : apt.child?.childName;
        return name?.toLowerCase().includes(searchLower);
      });
    }

    return filtered;
  };

  const getParentRelation = (gender) => {
    return gender?.toLowerCase() === 'male' ? 'Cha' : 'Mẹ';
  };

  const renderModalContent = (appointment) => {
    if (!appointment) return null;

    return (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã đơn">{appointment._id}</Descriptions.Item>
        <Descriptions.Item label="Loại tiêm">
          <Tag color={appointment.type === 'Tiêm gói' ? '#87d068' : '#108ee9'}>
            {appointment.type}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Người tiêm">
          {!appointment.child || appointment.child === null ? (
            appointment.customer?.customerName
          ) : (
            <div>
              <div>Trẻ: {appointment.child?.childName}</div>
              <div>
                {getParentRelation(appointment.customer?.gender)}: {appointment.customer?.customerName}
              </div>
              <div>Ngày sinh trẻ: {appointment.child?.birthday}</div>
              {appointment.child?.healthNote && (
                <div>Ghi chú sức khỏe: {appointment.child.healthNote}</div>
              )}
            </div>
          )}
        </Descriptions.Item>
        {appointment.type === 'Tiêm gói' ? (
          <>
            <Descriptions.Item label="Tên gói vaccine">{appointment.vaccine?.packageName}</Descriptions.Item>
            <Descriptions.Item label="Mô tả gói">{appointment.vaccine?.description}</Descriptions.Item>
            <Descriptions.Item label="Giá gói">{appointment.vaccine?.price?.toLocaleString('vi-VN')} VNĐ</Descriptions.Item>
            <Descriptions.Item label="Danh sách vaccine trong gói">
              {appointment.vaccine?.vaccines.map((vaccine, index) => (
                <div key={index} className="vaccine-package-item">
                  <Tag color="#108ee9">Vaccine {index + 1}</Tag>
                  <div className="vaccine-detail">
                    <div>• Tên vaccine: {vaccineList[vaccine.vaccineId] || 'Chưa có thông tin'}</div>
                    <div>• Số liều cần tiêm: {vaccine.quantity}</div>
                  </div>
                </div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Lịch tiêm theo gói">
              {appointment.doseSchedule?.map((dose, index) => (
                <div key={index} className="dose-schedule-item">
                  <h4>Mũi {dose.doseNumber}</h4>
                  <div className="dose-info">
                    <div>Ngày tiêm: {dose.date}</div>
                    <div>
                      Trạng thái: 
                      <Tag color={getStatusColor(dose.status)}>
                        {getStatusText(dose.status)}
                      </Tag>
                    </div>
                  </div>
                </div>
              ))}
            </Descriptions.Item>
          </>
        ) : (
          <>
            <Descriptions.Item label="Tên vaccine">{appointment.vaccine?.vaccineName}</Descriptions.Item>
            <Descriptions.Item label="Nhà sản xuất">{appointment.vaccine?.manufacturer}</Descriptions.Item>
            <Descriptions.Item label="Mô tả vaccine">{appointment.vaccine?.description}</Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Ngày đăng ký">{appointment.createdAt}</Descriptions.Item>
        <Descriptions.Item label="Ngày tiêm">{appointment.date}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={getStatusColor(appointment.status)}>
            {getStatusText(appointment.status)}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      sorter: (a, b) => {
        // Chuyển đổi định dạng ngày từ DD/MM/YYYY sang Date object
        const [dayA, monthA, yearA] = a.createdAt.split('/');
        const [dayB, monthB, yearB] = b.createdAt.split('/');
        
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        
        return dateB - dateA; // Sắp xếp để ngày sớm hơn hiển thị trước
      },
      defaultSortOrder: 'ascend',
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Người tiêm',
      key: 'name',
      width: '20%',
      render: (_, record) => {
        const name = !record.child || record.child === null
          ? record.customer?.customerName
          : record.child?.childName;
        return (
          <div>
            <div>{name}</div>
            {record.child && (
              <small style={{ color: '#666' }}>
                {getParentRelation(record.customer?.gender)}: {record.customer?.customerName}
              </small>
            )}
          </div>
        );
      },
      sorter: (a, b) => {
        const nameA = !a.child ? a.customer?.customerName : a.child?.childName;
        const nameB = !b.child ? b.customer?.customerName : b.child?.childName;
        return nameA?.localeCompare(nameB);
      },
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      filterMode: 'tree',
      filterSearch: true,
      onFilter: (value, record) => {
        const name = !record.child ? record.customer?.customerName : record.child?.childName;
        return name?.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
    },
    {
      title: 'Loại tiêm',
      key: 'type',
      width: '15%',
      render: (_, record) => (
        <Tag color={record.type === 'Tiêm gói' ? '#87d068' : '#108ee9'}>
          {record.type}
        </Tag>
      ),
      filters: [
        { text: 'Tiêm gói', value: 'Tiêm gói' },
        { text: 'Tiêm lẻ', value: 'Tiêm lẻ' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '15%',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)} className="status-tag">
          {getStatusText(record.status)}
        </Tag>
      ),
      ...(activeTab !== 'pending' && {
        filters: [
          { text: 'Hoàn thành', value: 'completed' },
          { text: 'Chưa hoàn thành', value: 'incomplete' },
          { text: 'Đang chờ', value: 'pending' },
          { text: 'Đã duyệt', value: 'approve' },
        ],
        onFilter: (value, record) => record.status?.toLowerCase() === value,
      }),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => showModal(record)}
          size="medium"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="history-container">
      <div className="content-header">
        <h2>Lịch Sử Tiêm Chủng</h2>
        <p>Xem lịch sử đặt lịch và trạng thái tiêm chủng của bạn</p>
      </div>

      <div className="search-section">
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
      </div>

      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="custom-tabs"
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
          <Table
            columns={columns}
            dataSource={getFilteredAppointments('pending')}
            rowKey="_id"
            loading={loading}
            onChange={handleChange}
            pagination={{
              pageSize: 7,
              position: ['bottomCenter'],
              showSizeChanger: false,
            }}
            className="history-table"
          />
        </TabPane>
        <TabPane
          tab={<span className="tab-label">Các đơn khác</span>}
          key="others"
        >
          <Table
            columns={columns}
            dataSource={getFilteredAppointments('others')}
            rowKey="_id"
            loading={loading}
            onChange={handleChange}
            pagination={{
              pageSize: 7,
              position: ['bottomCenter'],
              showSizeChanger: false,
            }}
            className="history-table"
          />
        </TabPane>
      </Tabs>

      <Modal
        title={`Chi tiết đơn ${selectedAppointment?.type || ''}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {renderModalContent(selectedAppointment)}
      </Modal>
    </div>
  );
};

export default ProfileHistory;