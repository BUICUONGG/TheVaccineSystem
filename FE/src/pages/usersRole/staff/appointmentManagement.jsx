import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tag, Button, Select, message, Modal, Tabs, Input, List, Card, Typography, Checkbox } from "antd";
import { SearchOutlined, CheckCircleFilled, MenuOutlined } from "@ant-design/icons";
import moment from 'moment';
import "./appointmentManagement.css";

// const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Các hàm tiện ích
const STATUS_COLORS = {
  completed: "green",
  incomplete: "red",
  pending: "orange",
  approve: "blue",
  default: "default"
};

const STATUS_TEXTS = {
  completed: "Hoàn thành",
  incomplete: "Đã hủy",
  pending: "Đang chờ",
  approve: "Đã duyệt",
  default: "Không xác định"
};

const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;
const getStatusText = (status) => STATUS_TEXTS[status] || STATUS_TEXTS.default;

// Hàm chuyển đổi chuỗi ngày thành đối tượng Date
const parseDate = (dateStr) => {
  const formats = ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY'];
  
  for (const format of formats) {
    const date = moment(dateStr, format, true);
    if (date.isValid()) return date;
  }
  
  return moment(new Date(dateStr));
};

const AppointmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [appointmentsLe, setAppointmentsLe] = useState([]);
  const [appointmentsGoi, setAppointmentsGoi] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accesstoken");
      
      // Fetch appointments lẻ
      const responseLe = await axios.get(
        "http://localhost:8080/appointmentLe/getdetailallaptle",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Fetch appointments gói - sử dụng API chi tiết
      const responseGoi = await axios.get(
        "http://localhost:8080/appointmentGoi/showDetailAptGoi",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Không cần fetch thêm thông tin nếu API đã trả về đầy đủ
      setAppointmentsLe(responseLe.data || []);
      setAppointmentsGoi(responseGoi.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status, isPackage) => {
    try {
      const token = localStorage.getItem("accesstoken");
      const endpoint = isPackage 
        ? `http://localhost:8080/appointmentGoi/update/${id}`
        : `http://localhost:8080/appointmentLe/update/${id}`;
      
      await axios.post(
        endpoint,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let successMessage = "";
      if (status === "completed") {
        successMessage = "Đã hoàn thành đơn thành công";
      } else if (status === "approve") {
        successMessage = "Đã duyệt đơn thành công";
      } else if (status === "incomplete") {
        successMessage = "Đã hủy đơn thành công";
      } else {
        successMessage = "Đã cập nhật trạng thái đơn thành công";
      }
      
      message.success(successMessage);
      fetchAppointments();
      
      // Cập nhật trạng thái trong modal nếu đang mở
      if (isModalVisible && selectedAppointment && selectedAppointment._id === id) {
        setSelectedAppointment({
          ...selectedAppointment,
          status
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      
      let errorMessage = "";
      if (status === "completed") {
        errorMessage = "Không thể hoàn thành đơn";
      } else if (status === "approve") {
        errorMessage = "Không thể duyệt đơn";
      } else if (status === "incomplete") {
        errorMessage = "Không thể hủy đơn";
      } else {
        errorMessage = "Không thể cập nhật trạng thái đơn";
      }
      
      message.error(errorMessage);
    }
  };

  const handleDoseStatusChange = async (appointmentId, doseNumber, completed) => {
    try {
      const token = localStorage.getItem("accesstoken");
      
      // Convert boolean to status string
      const status = completed ? "completed" : "pending";
      
      console.log("Updating dose status:", { appointmentId, doseNumber, status });
      
      // Make API call to update dose status
      const response = await axios.post(
        `http://localhost:8080/appointmentGoi/updateDose/${appointmentId}`,
        { 
          doseNumber: parseInt(doseNumber),
          status 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("API response:", response.data);
      
      if (response.data) {
        message.success(`Cập nhật trạng thái mũi ${doseNumber} thành công`);
        
        // Update the UI immediately
        if (selectedAppointment && selectedAppointment._id === appointmentId) {
          // Create a new dose schedule array with the updated status
          const updatedDoseSchedule = selectedAppointment.doseSchedule.map(dose => {
            if (dose.doseNumber === parseInt(doseNumber)) {
              console.log(`Updating dose ${doseNumber} from ${dose.status} to ${status}`);
              return { ...dose, status };
            }
            return dose;
          });
          
          console.log("Updated dose schedule:", updatedDoseSchedule);
          
          // Update the selected appointment state with the new dose schedule
          setSelectedAppointment({
            ...selectedAppointment,
            doseSchedule: updatedDoseSchedule
          });
          
          // Kiểm tra xem tất cả các mũi tiêm đã hoàn thành chưa
          const allDosesCompleted = updatedDoseSchedule.every(dose => dose.status === "completed");
          
          // Nếu tất cả các mũi tiêm đã hoàn thành và trạng thái hiện tại không phải là "completed"
          if (allDosesCompleted && selectedAppointment.status !== "completed") {
            console.log("All doses completed, updating appointment status to completed");
            
            // Cập nhật trạng thái lịch hẹn thành "completed"
            await handleStatusChange(appointmentId, "completed", true);
            
            // Hiển thị thông báo
            message.success("Tất cả các mũi tiêm đã hoàn thành, lịch hẹn đã được cập nhật thành Hoàn thành");
          }
        }
        
        // Refresh the appointments list to ensure consistency
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating dose status:", error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        console.log("Error response:", error.response);
        message.error(`Không thể cập nhật trạng thái mũi ${doseNumber}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        console.log("Error request:", error.request);
        message.error(`Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.`);
      } else {
        message.error(`Lỗi: ${error.message}`);
      }
    }
  };

  const showAppointmentDetails = async (record, isPackage) => {
    try {
      // Kiểm tra nếu đơn đã bị hủy thì không hiển thị chi tiết
      if (record.status === "incomplete") {
        message.info("Không thể xem chi tiết đơn đã bị hủy");
        return;
      }
      
      // Kiểm tra nếu đơn đã hoàn thành thì không hiển thị chi tiết
      if (record.status === "completed") {
        message.info("Không thể xem chi tiết đơn đã hoàn thành");
        return;
      }
      
      setDetailLoading(true);
      setIsModalVisible(true);
      
      // Đánh dấu loại lịch hẹn
      record.isPackage = isPackage;
      
      // Không cần fetch thêm thông tin nếu API đã trả về đầy đủ
      setSelectedAppointment(record);
    } catch (error) {
      console.error("Error showing appointment details:", error);
      message.error("Không thể hiển thị chi tiết lịch hẹn");
    } finally {
      setDetailLoading(false);
    }
  };

  // Định nghĩa cột chung
  const getBaseColumns = (isPackage) => [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 50,
    },
    {
      title: "Khách hàng",
      dataIndex: "cusId",
      key: "cusId",
      render: (cusId, record) => {
        if (isPackage) {
          return record.customer?.customerName || 
            record.customerDetails?.customerName || 
            cusId?.customerName || 
            cusId?.name || 
            (typeof cusId === 'string' ? cusId : "N/A");
        } else {
          return record.customer?.customerName || 
            cusId?.customerName || 
            cusId?.name || 
            "N/A";
        }
      },
    },
    {
      title: isPackage ? "Gói vaccine" : "Vaccine",
      dataIndex: isPackage ? "vaccinePakageId" : "vaccineId",
      key: isPackage ? "vaccinePakageId" : "vaccineId",
      render: (value, record) => {
        if (isPackage) {
          return record.package?.packageName ||
            record.vaccinePakage?.packageName ||
            record.packageDetails?.packageName || 
            value?.packageName || 
            value?.name || 
            (typeof value === 'string' ? value : "N/A");
        } else {
          if (record.vaccine?.vaccineName) return record.vaccine.vaccineName;
          if (value?.vaccineName) return value.vaccineName;
          if (value?.name) return value.name;
          return value ? value.toString().substring(0, 8) + "..." : "N/A";
        }
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        
        return dateA - dateB;
      },
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'descend',
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đã duyệt", value: "approve" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã hủy", value: "incomplete" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            type="primary" 
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', marginRight: 8 }}
            onClick={() => handleStatusChange(record._id, isPackage ? "approve" : "completed", isPackage)}
            disabled={record.status === "incomplete" || record.status === "completed"}
          >
            Duyệt
          </Button>
          <Button 
            danger
            onClick={() => handleStatusChange(record._id, "incomplete", isPackage)}
            disabled={record.status === "incomplete" || record.status === "completed"}
          >
            Hủy Đơn
          </Button>
        </div>
      ),
    },
    {
      title: "Chi tiết",
      key: "details",
      width: 80,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<MenuOutlined />}
          onClick={() => showAppointmentDetails(record, isPackage)}
          disabled={record.status === "incomplete" || record.status === "completed"}
        />
      ),
    },
  ];

  const columnsLe = getBaseColumns(false);
  const columnsGoi = getBaseColumns(true);

  // Hàm lọc chung cho cả hai loại lịch hẹn
  const filterAppointments = (appointments, isPackage) => {
    return appointments.filter(apt => {
      // Lấy tên khách hàng
      const customerName = isPackage
        ? (apt.customer?.customerName || 
           apt.customerDetails?.customerName || 
           apt.cusId?.customerName || 
           apt.cusId?.name || "")
        : (apt.customer?.customerName || 
           apt.cusId?.customerName || 
           apt.cusId?.name || "");
      
      // Lấy tên vaccine/gói vaccine
      const vaccineName = isPackage
        ? (apt.package?.packageName || 
           apt.vaccinePakage?.packageName || 
           apt.packageDetails?.packageName || 
           apt.vaccinePakageId?.packageName || 
           apt.vaccinePakageId?.name || "")
        : (apt.vaccine?.vaccineName || 
           apt.vaccineId?.vaccineName || 
           apt.vaccineId?.name || "");
      
      // Kiểm tra xem có khớp với từ khóa tìm kiếm không
      return apt._id?.toLowerCase().includes(searchText.toLowerCase()) ||
        customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        vaccineName.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.date?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.status?.toLowerCase().includes(searchText.toLowerCase());
    });
  };

  const filteredAppointmentsLe = filterAppointments(appointmentsLe, false);
  const filteredAppointmentsGoi = filterAppointments(appointmentsGoi, true);

  // Hàm render chi tiết lịch hẹn
  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;
    
    const isPackage = selectedAppointment.isPackage;
    
    // Lấy thông tin khách hàng
    const getCustomerInfo = (field) => {
      if (isPackage) {
        return selectedAppointment.customer?.[field] || 
               selectedAppointment.customerDetails?.[field] || 
               selectedAppointment.cusId?.[field] || "N/A";
      } else {
        return selectedAppointment.customer?.[field] || 
               selectedAppointment.cusId?.[field] || "N/A";
      }
    };
    
    // Lấy tên vaccine/gói vaccine
    const getVaccineInfo = () => {
      if (isPackage) {
        return selectedAppointment.package?.packageName || 
               selectedAppointment.vaccinePakage?.packageName ||
               selectedAppointment.packageDetails?.packageName || 
               selectedAppointment.vaccinePakageId?.packageName || 
               selectedAppointment.vaccinePakageId?.name || 
               (selectedAppointment.vaccinePakageId ? selectedAppointment.vaccinePakageId.toString() : "N/A");
      } else {
        return selectedAppointment.vaccine?.vaccineName || 
               selectedAppointment.vaccineId?.vaccineName || 
               selectedAppointment.vaccineId?.name || "N/A";
      }
    };
    
    return (
      <div className="appointment-details">
        <div className="detail-row">
          <span className="detail-label">Mã lịch hẹn:</span>
          <span className="detail-value">{selectedAppointment._id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Khách hàng:</span>
          <span className="detail-value">
            {isPackage 
              ? (selectedAppointment.customer?.customerName || 
                 selectedAppointment.customerDetails?.customerName || 
                 selectedAppointment.cusId?.customerName || 
                 selectedAppointment.cusId?.name || 
                 (typeof selectedAppointment.cusId === 'string' ? selectedAppointment.cusId : "N/A"))
              : (selectedAppointment.customer?.customerName || 
                 selectedAppointment.cusId?.customerName || 
                 selectedAppointment.cusId?.name || 
                 (selectedAppointment.cusId ? selectedAppointment.cusId.toString() : "N/A"))}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Số điện thoại:</span>
          <span className="detail-value">{getCustomerInfo('phone')}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Địa chỉ:</span>
          <span className="detail-value">{getCustomerInfo('address')}</span>
        </div>
        {selectedAppointment.childId && (
          <div className="detail-row">
            <span className="detail-label">Trẻ em:</span>
            <span className="detail-value">
              {selectedAppointment.childId.childName || selectedAppointment.childId.toString()}
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">
            {isPackage ? "Gói vaccine:" : "Vaccine:"}
          </span>
          <span className="detail-value">{getVaccineInfo()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Ngày hẹn:</span>
          <span className="detail-value">{selectedAppointment.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Ngày tạo:</span>
          <span className="detail-value">{selectedAppointment.createAt}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Trạng thái:</span>
          <span className="detail-value">
            <Tag color={getStatusColor(selectedAppointment.status)}>
              {getStatusText(selectedAppointment.status)}
            </Tag>
          </span>
        </div>
        
        {/* Hiển thị lịch tiêm cho từng mũi (chỉ với lịch hẹn gói) */}
        {isPackage && selectedAppointment.doseSchedule && selectedAppointment.doseSchedule.length > 0 && (
          <div className="dose-schedule-section">
            <Title level={5} style={{ marginTop: 20, marginBottom: 10 }}>Lịch tiêm các mũi</Title>
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={selectedAppointment.doseSchedule}
              renderItem={item => (
                <List.Item>
                  <Card 
                    title={`Mũi ${item.doseNumber}`} 
                    size="small"
                    style={{ marginBottom: 8 }}
                    extra={
                      <Tag color={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Tag>
                    }
                  >
                    <div className="dose-detail-row">
                      <Text strong>Ngày tiêm:</Text> {item.date}
                    </div>
                    <div className="dose-detail-row" style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                      <Button
                        type={item.status === "completed" ? "primary" : "default"}
                        icon={item.status === "completed" ? <CheckCircleFilled /> : null}
                        onClick={() => {
                          const newStatus = item.status === "completed" ? "pending" : "completed";
                          handleDoseStatusChange(
                            selectedAppointment._id,
                            item.doseNumber,
                            newStatus === "completed"
                          );
                        }}
                        style={{ 
                          backgroundColor: item.status === "completed" ? "#52c41a" : undefined,
                          borderColor: item.status === "completed" ? "#52c41a" : undefined
                        }}
                      >
                        {item.status === "completed" ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                      </Button>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="appointment-management">
      <h1>Quản lý lịch hẹn</h1>
      
      <div className="search-container">
        <Input
          placeholder="Tìm kiếm lịch hẹn..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Lịch hẹn lẻ" key="1">
          <Table
            columns={columnsLe}
            dataSource={filteredAppointmentsLe}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Lịch hẹn gói" key="2">
          <Table
            columns={columnsGoi}
            dataSource={filteredAppointmentsGoi}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Chi tiết lịch hẹn"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
        confirmLoading={detailLoading}
      >
        {detailLoading ? (
          <div className="loading-details">Đang tải thông tin chi tiết...</div>
        ) : renderAppointmentDetails()}
      </Modal>
    </div>
  );
};

export default AppointmentManagement; 