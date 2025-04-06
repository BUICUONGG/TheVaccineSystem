import { useState, useEffect } from "react";
import { 
  Table, 
  Tag, 
  Button, 
  message, 
  Modal, 
  Input, 
  List, 
  Typography, 
  Divider, 
  Tabs,
  Tooltip,
  DatePicker,
  Descriptions,
  Progress
} from "antd";
import { 
  SearchOutlined, 
  CheckCircleFilled, 
  MenuOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  CheckOutlined
} from "@ant-design/icons";
import moment from "moment";
import axiosInstance from "../../../service/api";
import "./appointmentManagement.css";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AppointmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [detailLoading, setDetailLoading] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isInjectionNoteModalVisible, setIsInjectionNoteModalVisible] = useState(false);
  const [injectionNote, setInjectionNote] = useState("");
  const [currentInjectionRecord, setCurrentInjectionRecord] = useState(null);
  const [injectionProgress, setInjectionProgress] = useState(0);
  const [injectionTimer, setInjectionTimer] = useState(null);
  
  // Thêm state để lưu danh sách users và vaccines
  const [userList, setUserList] = useState([]);
  const [vaccineList, setVaccineList] = useState([]);
  const [vaccinePackageList, setVaccinePackageList] = useState([]);
  const [customers, setCustomers] = useState([]);

  // State để quản lý modal check out
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [checkoutNote, setCheckoutNote] = useState("");
  const [currentCheckoutRecord, setCurrentCheckoutRecord] = useState(null);

  // Fetch users, vaccines, and appointments on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");

      // Fetch customers
      const customersResponse = await axiosInstance.get("/customer/getAllCustomer", {
        headers: { Authorization: `Bearer ${accesstoken}` }
      });
      const customersData = customersResponse.data.result || [];
      setCustomers(customersData);

      // Fetch vaccines
      const vaccinesResponse = await axiosInstance.get("/vaccine/showInfo", {
        headers: { Authorization: `Bearer ${accesstoken}` }
      });
      setVaccineList(vaccinesResponse.data);

      // Fetch vaccine packages
      const packagesResponse = await axiosInstance.get("/vaccinepakage/showVaccinePakage", {
        headers: { Authorization: `Bearer ${accesstoken}` }
      });
      setVaccinePackageList(packagesResponse.data);

      // Fetch appointments
      const [leResponse, goiResponse] = await Promise.all([
        axiosInstance.get("/appointmentLe/showInfo"),
        axiosInstance.get("/appointmentGoi/showInfo")
      ]);
      
      // Enrich appointments with customer username and vaccine names
      const enrichedLe = leResponse.data.map(apt => ({
        ...apt,
        type: "Lẻ",
        customerName: customersData.find(c => c._id === apt.cusId)?.username || "Không xác định",
        customerFullName: customersData.find(c => c._id === apt.cusId)?.customerName || "Không xác định",
        customerGender: customersData.find(c => c._id === apt.cusId)?.gender || "Không xác định",
        vaccineName: vaccinesResponse.data.find(v => v._id === apt.vaccineId)?.vaccineName || "Không xác định",
        createdAt: apt.createdAt || "Không xác định"
      }));

      const enrichedGoi = goiResponse.data.map(apt => ({
        ...apt,
        type: "Gói",
        customerName: customersData.find(c => c._id === apt.cusId)?.username || "Không xác định",
        customerFullName: customersData.find(c => c._id === apt.cusId)?.customerName || "Không xác định",
        customerGender: customersData.find(c => c._id === apt.cusId)?.gender || "Không xác định",
        vaccineName: packagesResponse.data.find(p => p._id === apt.vaccinePackageId)?.packageName || "Không xác định",
        createdAt: apt.createdAt || "Không xác định"
      }));
      
      // Gộp và sắp xếp appointments
      const mergedAppointments = [...enrichedLe, ...enrichedGoi].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setAppointments(mergedAppointments);
      setFilteredAppointments(mergedAppointments);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get username by ID
  const getUsernameById = (userId) => {
    const user = userList.find(u => u._id === userId);
    return user ? user.username : "Không xác định";
  };

  // Helper function to get vaccine name by ID
  const getVaccineNameById = (vaccineId) => {
    const vaccine = vaccineList.find(v => v._id === vaccineId);
    return vaccine ? vaccine.vaccineName : "Không xác định";
  };

  // Helper function to get package name by ID
  const getPackageNameById = (packageId) => {
    const pkg = vaccinePackageList.find(p => p._id === packageId);
    return pkg ? pkg.packageName : "Không xác định";
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filteredData = appointments.filter(apt => 
      Object.values(apt).some(val => 
        String(val).toLowerCase().includes(value)
      )
    );

    setFilteredAppointments(filteredData);
  };

  const getStatusColor = (status) => {
    const statusColorMap = {
      "completed": "green",
      "incomplete": "red",
      "Pending": "darkred",
      "Paid": "blue",
      "đã tới": "orange",
      "đã khám": "purple",
      "đang chờ": "gold"
    };
    return statusColorMap[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTextMap = {
      "completed": "HOÀN THÀNH",
      "incomplete": "Đã hủy",
      "Pending": "Hủy thanh toán",
      "Paid": "ĐÃ THANH TOÁN",
      "đã tới": "ĐÃ TỚI",
      "đã khám": "ĐÃ KHÁM",
      "đang chờ": "Đang chờ kết quả tiêm"
    };
    return statusTextMap[status] || "Không xác định";
  };

  const handleCheckin = async (record) => {
    try {
      const updateEndpoint = record.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      await axiosInstance.post(updateEndpoint + record._id, {
        status: "đã tới"
      });
      
      message.success("Check-in thành công");
      fetchAllData();
    } catch (error) {
      message.error("Không thể check-in");
    }
  };

  const handleMedicalScreening = async (record, isNormal) => {
    try {
      const updateEndpoint = record.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      const newStatus = isNormal ? "đã khám" : "Paid";
      
      // Nếu không bình thường, mở modal để nhập note và chọn lại ngày
      if (!isNormal) {
        setSelectedAppointment(record);
        setIsRescheduleModalVisible(true);
        return;
      }

      await axiosInstance.post(updateEndpoint + record._id, {
        status: newStatus,
        note: ""
      });
      
      message.success(isNormal 
        ? "Khám sàng lọc bình thường" 
        : "Khám sàng lọc bất thường"
      );
      fetchAllData();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const handleStartInjection = async (record) => {
    try {
      const updateEndpoint = record.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      // Cập nhật trạng thái sang "đang chờ" ngay từ đầu
      await axiosInstance.post(updateEndpoint + record._id, {
        status: "đang chờ"
      });
      
      // Lưu record hiện tại và reset note
      setCurrentInjectionRecord(record);
      setInjectionNote("");
      
      message.success("Bắt đầu tiêm");
      fetchAllData(); // Refresh data to show updated status
    } catch (error) {
      message.error("Không thể bắt đầu tiêm");
    }
  };

  const handleContinueInjection = async () => {
    if (!currentInjectionRecord) return;

    try {
      const updateEndpoint = currentInjectionRecord.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      // Đóng modal ghi chú
      setIsInjectionNoteModalVisible(false);

      // Gọi API update note
      await axiosInstance.post(updateEndpoint + currentInjectionRecord._id, {
        note: injectionNote || "Bình thường"
      });

      message.success("Cập nhật ghi chú thành công");
      fetchAllData();
      
      // Reset trạng thái
      setCurrentInjectionRecord(null);
      setInjectionNote("");
    } catch (error) {
      message.error("Không thể cập nhật ghi chú");
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate) {
      message.error("Vui lòng chọn ngày hẹn mới");
      return;
    }

    try {
      const updateEndpoint = selectedAppointment.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      await axiosInstance.post(updateEndpoint + selectedAppointment._id, {
        status: "Paid",
        note: "Khám sàng lọc bất thường, cần đánh giá lại",
        date: rescheduleDate.format("DD/MM/YYYY")
      });

      message.success("Đã cập nhật lịch hẹn và ghi chú");
      setIsRescheduleModalVisible(false);
      setSelectedAppointment(null);
      setRescheduleDate(null);
      fetchAllData();
    } catch (error) {
      message.error("Không thể cập nhật lịch hẹn");
    }
  };

  const showAppointmentDetails = (record) => {
    setSelectedAppointmentDetail(record);
    setIsDetailModalVisible(true);
  };

  // Hàm hiển thị modal check out
  const showCheckoutModal = (record) => {
    setCurrentCheckoutRecord(record);
    setCheckoutNote(record.note || "");
    setIsCheckoutModalVisible(true);
  };

  // Hàm thực hiện check out
  const handleCheckout = async () => {
    if (!currentCheckoutRecord) return;

    try {
      const updateEndpoint = currentCheckoutRecord.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      // Cập nhật trạng thái và note
      await axiosInstance.post(updateEndpoint + currentCheckoutRecord._id, {
        status: "completed",
        note: checkoutNote || "Hoàn thành tiêm, sức khỏe ổn định"
      });

      message.success("Check-out thành công");
      
      // Đóng modal và làm mới dữ liệu
      setIsCheckoutModalVisible(false);
      setCurrentCheckoutRecord(null);
      setCheckoutNote("");
      fetchAllData();
    } catch (error) {
      message.error("Không thể check-out");
    }
  };

  // Điều chỉnh renderActionButtons để thêm nút check out
  const renderActionButtons = (record) => {
    const actionMap = {
      "1": ( // Tab Quầy Check-In
        <Button 
          type="primary" 
          icon={<CheckCircleOutlined />} 
          onClick={() => handleCheckin(record)}
        >
          Check-in
        </Button>
      ),
      "2": ( // Tab Phòng Khám Sàng Lọc
        <div>
          <Tooltip title="Khám bình thường">
            <Button 
              type="primary" 
              icon={<CheckCircleFilled />} 
              onClick={() => handleMedicalScreening(record, true)}
              style={{ marginRight: 8 }}
            >
              Bình thường
            </Button>
          </Tooltip>
          <Tooltip title="Khám bất thường">
            <Button 
              type="danger" 
              icon={<ExclamationCircleOutlined />} 
              onClick={() => handleMedicalScreening(record, false)}
            >
              Bất thường
            </Button>
          </Tooltip>
        </div>
      ),
      "3": ( // Tab Phòng Tiêm
        <Button 
          type="primary" 
          icon={<ClockCircleOutlined />} 
          onClick={() => handleStartInjection(record)}
        >
          Bắt đầu tiêm
        </Button>
      ),
      "4": ( // Tab Phòng Theo Dõi Sau Tiêm
        <Button 
          type="primary" 
          icon={<CheckOutlined />} 
          onClick={() => showCheckoutModal(record)}
        >
          Check-out
        </Button>
      ),
      "5": null  // Tab Check-Out - không có nút hành động
    };

    return actionMap[activeTab] || null;
  };

  // Thêm modal để chọn lại ngày hẹn
  const renderRescheduleModal = () => (
    <Modal
      title="Chọn lại ngày hẹn"
      open={isRescheduleModalVisible}
      onOk={handleReschedule}
      onCancel={() => {
        setIsRescheduleModalVisible(false);
        setSelectedAppointment(null);
        setRescheduleDate(null);
      }}
    >
      <div>
        <p>Vui lòng chọn ngày hẹn mới do kết quả khám sàng lọc bất thường:</p>
        <DatePicker 
          style={{ width: '100%' }} 
          onChange={(date) => setRescheduleDate(date)}
          disabledDate={(current) => current && current < moment().startOf('day')}
        />
      </div>
    </Modal>
  );

  const renderDetailModal = () => (
    <Modal
      title="Chi tiết lịch hẹn"
      open={isDetailModalVisible}
      onCancel={() => {
        setIsDetailModalVisible(false);
        setSelectedAppointmentDetail(null);
      }}
      footer={[
        <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
          Đóng
        </Button>
      ]}
      width={600}
    >
      {selectedAppointmentDetail && (
        <div>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã đơn hàng">
              {selectedAppointmentDetail._id}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">
              {selectedAppointmentDetail.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Tên khách hàng">
              {selectedAppointmentDetail.customerFullName}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedAppointmentDetail.customerGender === 'Male' ? 'Nam' : 
               selectedAppointmentDetail.customerGender === 'Female' ? 'Nữ' : 'Khác'}
            </Descriptions.Item>
            <Descriptions.Item label="Vaccine">
              {selectedAppointmentDetail.vaccineName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo đơn">
              {selectedAppointmentDetail.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hẹn">
              {selectedAppointmentDetail.date}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedAppointmentDetail.status)}>
                {getStatusText(selectedAppointmentDetail.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú trong quá trình tiêm">
              {selectedAppointmentDetail.note || "Sức khỏe ổn định, có thể tiêm"}
            </Descriptions.Item>
          </Descriptions>

          {selectedAppointmentDetail.childInfo && (
            <>
              <Divider />
              <h3>Thông tin trẻ em</h3>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên trẻ">
                  {selectedAppointmentDetail.childInfo.name}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {selectedAppointmentDetail.childInfo.birthday}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {selectedAppointmentDetail.childInfo.gender === 'male' ? 'Nam' : 'Nữ'}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú sức khỏe">
                  {selectedAppointmentDetail.childInfo.healthNote || "Không có ghi chú"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </div>
      )}
    </Modal>
  );

  const renderInjectionNoteModal = () => (
    <Modal
      title="Ghi chú trong quá trình tiêm"
      open={isInjectionNoteModalVisible}
      onOk={handleContinueInjection}
      okText="Tiếp tục"
    >
      <Input.TextArea 
        rows={4} 
        placeholder="Nhập ghi chú về quá trình tiêm (nếu có)"
        value={injectionNote}
        onChange={(e) => setInjectionNote(e.target.value)}
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Progress 
          percent={(injectionProgress / 10) * 100} 
          status="active" 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      </div>
    </Modal>
  );

  // Modal check out
  const renderCheckoutModal = () => (
    <Modal
      title="Check-out Sau Tiêm"
      open={isCheckoutModalVisible}
      onOk={handleCheckout}
      onCancel={() => {
        setIsCheckoutModalVisible(false);
        setCurrentCheckoutRecord(null);
        setCheckoutNote("");
      }}
      okText="Hoàn tất"
      cancelText="Hủy"
    >
      <Input.TextArea 
        rows={4} 
        placeholder="Nhập ghi chú sau khi theo dõi (nếu có)"
        value={checkoutNote}
        onChange={(e) => setCheckoutNote(e.target.value)}
      />
      <div style={{ marginTop: 16, color: '#666' }}>
        <p>Vui lòng ghi chú tình trạng sức khỏe sau khi tiêm và theo dõi</p>
      </div>
    </Modal>
  );

  // Cập nhật columns để thêm cột Loại
  const columns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Lẻ' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName'
    },
    {
      title: 'Ngày Tiêm',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => showAppointmentDetails(record)}
        >
          Xem chi tiết
        </Button>
      )
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => renderActionButtons(record)
    }
  ];

  // Hàm lọc appointments theo tab
  const getFilteredAppointmentsByTab = () => {
    const tabStatusMap = {
      "1": "Paid",
      "2": "đã tới",
      "3": "đã khám",
      "4": "đang chờ",
      "5": "completed"
    };

    const currentStatus = tabStatusMap[activeTab];
    return filteredAppointments.filter(apt => apt.status === currentStatus);
  };

  return (
    <div className="appointment-management">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "16px",
        alignItems: "center"
      }}>
      <h1>Quản lý lịch hẹn</h1>
        <Button 
          type="default" 
          icon={<ReloadOutlined />} 
          onClick={fetchAllData}
        >
          Làm mới dữ liệu
        </Button>
      </div>

      <div className="search-container">
        <Input
          placeholder="Tìm kiếm lịch hẹn..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          className="search-input"
          allowClear
        />
      </div>

      <Tabs 
        defaultActiveKey="1" 
        activeKey={activeTab} 
        onChange={(key) => setActiveTab(key)}
      >
        <TabPane tab="Quầy Check-In" key="1">
          <Table 
            columns={columns}
            dataSource={getFilteredAppointmentsByTab()}
            loading={loading}
            rowKey="_id"
          />
        </TabPane>
        <TabPane tab="Phòng Khám Sàng Lọc" key="2">
          <Table 
            columns={columns}
            dataSource={getFilteredAppointmentsByTab()}
            loading={loading}
            rowKey="_id"
          />
        </TabPane>
        <TabPane tab="Phòng Tiêm" key="3">
          <Table 
            columns={columns}
            dataSource={getFilteredAppointmentsByTab()}
            loading={loading}
            rowKey="_id"
          />
        </TabPane>
        <TabPane tab="Phòng Theo Dõi Sau Tiêm" key="4">
          <Table 
            columns={columns}
            dataSource={getFilteredAppointmentsByTab()}
            loading={loading}
            rowKey="_id"
          />
        </TabPane>
        <TabPane tab="Check-Out" key="5">
          <Table 
            columns={columns}
            dataSource={getFilteredAppointmentsByTab()}
            loading={loading}
            rowKey="_id"
          />
        </TabPane>
      </Tabs>

      {renderCheckoutModal()}
      {renderRescheduleModal()}
      {renderDetailModal()}
      {renderInjectionNoteModal()}
    </div>
  );
};

export default AppointmentManagement;
