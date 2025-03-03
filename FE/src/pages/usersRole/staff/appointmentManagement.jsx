import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tag, Button, Select, message, Modal, Tabs, Input, List, Card, Typography, Checkbox } from "antd";
import { SearchOutlined, CheckCircleFilled } from "@ant-design/icons";
import "./appointmentManagement.css";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

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
      
      // Fetch appointments gói
      const responseGoi = await axios.get(
        "http://localhost:8080/appointmentGoi/showInfo",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // For package appointments, fetch customer details for each appointment
      const appointmentsGoiWithCustomers = await Promise.all(
        (responseGoi.data || []).map(async (appointment) => {
          if (appointment.cusId) {
            try {
              const customerResponse = await axios.get(
                `http://localhost:8080/customer/getone/${appointment.cusId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return {
                ...appointment,
                customerDetails: customerResponse.data
              };
            } catch (error) {
              console.error("Error fetching customer details:", error);
              return appointment;
            }
          }
          return appointment;
        })
      );
      
      setAppointmentsLe(responseLe.data || []);
      setAppointmentsGoi(appointmentsGoiWithCustomers);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "incomplete":
        return "red";
      case "pending":
        return "orange";
      case "approve":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "incomplete":
        return "Chưa hoàn thành";
      case "pending":
        return "Đang chờ";
      case "approve":
        return "Đã duyệt";
      default:
        return "Không xác định";
    }
  };

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
      
      message.success("Cập nhật trạng thái thành công");
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
      message.error("Không thể cập nhật trạng thái");
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
        }
        
        // Refresh the appointments list to ensure consistency
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating dose status:", error);
      message.error(`Không thể cập nhật trạng thái mũi ${doseNumber}: ${error.response?.data?.message || error.message}`);
    }
  };

  const showAppointmentDetails = async (record, isPackage) => {
    try {
      setDetailLoading(true);
      setIsModalVisible(true);
      
      // Đánh dấu loại lịch hẹn
      record.isPackage = isPackage;
      
      if (isPackage) {
        // Nếu là lịch hẹn gói, cần fetch thêm thông tin chi tiết
        const token = localStorage.getItem("accesstoken");
        
        // Fetch thông tin khách hàng
        if (record.cusId) {
          try {
            const customerResponse = await axios.get(
              `http://localhost:8080/customer/getone/${record.cusId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            record.customerDetails = customerResponse.data;
          } catch (error) {
            console.error("Error fetching customer details:", error);
          }
        }
        
        // Fetch thông tin gói vaccine
        if (record.vaccinePakageId) {
          try {
            const packageResponse = await axios.get(
              `http://localhost:8080/vaccinepackage/getone/${record.vaccinePakageId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            record.packageDetails = packageResponse.data;
          } catch (error) {
            console.error("Error fetching package details:", error);
          }
        }
        
        // Fetch thông tin chi tiết lịch hẹn gói nếu chưa có doseSchedule
        if (!record.doseSchedule) {
          try {
            const appointmentResponse = await axios.get(
              `http://localhost:8080/appointmentGoi/getone/${record._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Merge the detailed data with our record
            record = { ...record, ...appointmentResponse.data };
          } catch (error) {
            console.error("Error fetching appointment details:", error);
          }
        }
      } else {
        // Nếu là lịch hẹn lẻ, có thể đã có đủ thông tin từ API getdetailallaptle
        // Nhưng nếu cần thêm thông tin chi tiết, có thể fetch thêm
        if (!record.customer || !record.vaccine) {
          const token = localStorage.getItem("accesstoken");
          try {
            const detailResponse = await axios.get(
              `http://localhost:8080/appointmentLe/getdetailaptlee/${record._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            record = {...record, ...detailResponse.data};
          } catch (error) {
            console.error("Error fetching appointment details:", error);
          }
        }
      }
      
      setSelectedAppointment(record);
    } catch (error) {
      console.error("Error showing appointment details:", error);
      message.error("Không thể hiển thị chi tiết lịch hẹn");
    } finally {
      setDetailLoading(false);
    }
  };

  const columnsLe = [
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
        // Try to get customer name from all possible sources
        const customerName = 
          record.customer?.customerName || 
          cusId?.customerName || 
          cusId?.name || 
          "N/A";
        
        return customerName;
      },
    },
    {
      title: "Vaccine",
      dataIndex: "vaccineId",
      key: "vaccineId",
      render: (vaccineId, record) => {
        if (record.vaccine?.vaccineName) return record.vaccine.vaccineName;
        if (vaccineId?.vaccineName) return vaccineId.vaccineName;
        if (vaccineId?.name) return vaccineId.name;
        return vaccineId ? vaccineId.toString().substring(0, 8) + "..." : "N/A";
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
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
            onClick={() => showAppointmentDetails(record, false)}
          >
            Chi tiết
          </Button>
          <Select
            defaultValue={record.status}
            style={{ width: 140, marginLeft: 8 }}
            onChange={(value) => handleStatusChange(record._id, value, false)}
          >
            <Option value="pending">Đang chờ</Option>
            <Option value="approve">Đã duyệt</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="incomplete">Chưa hoàn thành</Option>
          </Select>
        </div>
      ),
    },
  ];

  const columnsGoi = [
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
        // Try to get customer name from all possible sources
        const customerName = 
          record.customerDetails?.customerName || 
          "N/A";
        
        return customerName;
      },
    },
    {
      title: "Gói vaccine",
      dataIndex: "vaccinePakageId",
      key: "vaccinePakageId",
      render: (pkg, record) => {
        if (record.packageDetails?.packageName) return record.packageDetails.packageName;
        return pkg ? pkg.toString().substring(0, 8) + "..." : "N/A";
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
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
            onClick={() => showAppointmentDetails(record, true)}
          >
            Chi tiết
          </Button>
          
        </div>
      ),
    },
  ];

  const filteredAppointmentsLe = appointmentsLe.filter(apt => 
    apt._id?.toLowerCase().includes(searchText.toLowerCase()) ||
    (apt.customer?.customerName || apt.cusId?.customerName || apt.cusId?.name || "")?.toLowerCase().includes(searchText.toLowerCase()) ||
    (apt.vaccine?.vaccineName || apt.vaccineId?.vaccineName || apt.vaccineId?.name || "")?.toLowerCase().includes(searchText.toLowerCase()) ||
    apt.date?.toLowerCase().includes(searchText.toLowerCase()) ||
    apt.status?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredAppointmentsGoi = appointmentsGoi.filter(apt => 
    apt._id?.toLowerCase().includes(searchText.toLowerCase()) ||
    apt.date?.toLowerCase().includes(searchText.toLowerCase()) ||
    apt.status?.toLowerCase().includes(searchText.toLowerCase())
  );

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
        {selectedAppointment && !detailLoading ? (
          <div className="appointment-details">
            <div className="detail-row">
              <span className="detail-label">Mã lịch hẹn:</span>
              <span className="detail-value">{selectedAppointment._id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Khách hàng:</span>
              <span className="detail-value">
                {selectedAppointment.isPackage 
                  ? (selectedAppointment.customerDetails?.customerName || 
                     (selectedAppointment.cusId ? selectedAppointment.cusId.toString() : "N/A"))
                  : (selectedAppointment.customer?.customerName || 
                     selectedAppointment.cusId?.customerName || 
                     selectedAppointment.cusId?.name || 
                     (selectedAppointment.cusId ? selectedAppointment.cusId.toString() : "N/A"))}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số điện thoại:</span>
              <span className="detail-value">
                {selectedAppointment.isPackage
                  ? (selectedAppointment.customerDetails?.phone || "N/A")
                  : (selectedAppointment.customer?.phone || 
                     selectedAppointment.cusId?.phone || "N/A")}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Địa chỉ:</span>
              <span className="detail-value">
                {selectedAppointment.isPackage
                  ? (selectedAppointment.customerDetails?.address || "N/A")
                  : (selectedAppointment.customer?.address || 
                     selectedAppointment.cusId?.address || "N/A")}
              </span>
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
                {selectedAppointment.isPackage ? "Gói vaccine:" : "Vaccine:"}
              </span>
              <span className="detail-value">
                {selectedAppointment.isPackage 
                  ? (selectedAppointment.packageDetails?.packageName || 
                     (selectedAppointment.vaccinePakageId ? selectedAppointment.vaccinePakageId.toString() : "N/A"))
                  : (selectedAppointment.vaccine?.vaccineName || 
                     selectedAppointment.vaccineId?.vaccineName || 
                     selectedAppointment.vaccineId?.name || "N/A")}
              </span>
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
            {selectedAppointment.isPackage && selectedAppointment.doseSchedule && selectedAppointment.doseSchedule.length > 0 && (
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
                              console.log(`Toggling status for dose ${item.doseNumber} from ${item.status} to ${newStatus}`);
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
            
            <div className="detail-row" style={{ marginTop: 20 }}>
              <span className="detail-label">Cập nhật trạng thái:</span>
              <span className="detail-value">
                <Select
                  defaultValue={selectedAppointment.status}
                  style={{ width: 140 }}
                  onChange={(value) => handleStatusChange(
                    selectedAppointment._id, 
                    value, 
                    selectedAppointment.isPackage
                  )}
                >
                  <Option value="pending">Đang chờ</Option>
                  <Option value="approve">Đã duyệt</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="incomplete">Chưa hoàn thành</Option>
                </Select>
              </span>
            </div>
          </div>
        ) : (
          <div className="loading-details">Đang tải thông tin chi tiết...</div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement; 