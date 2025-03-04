import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tag, Button, Select, message, Modal, Tabs, Input, List, Card, Typography, Checkbox } from "antd";
import { SearchOutlined, CheckCircleFilled } from "@ant-design/icons";
import "../staff/appointmentManagement.css";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AdminAppointmentManagement = () => {
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
            
            // Merge the detailed data with our record
            record = { ...record, ...detailResponse.data };
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

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredAppointmentsLe = appointmentsLe.filter(appointment => {
    const searchLower = searchText.toLowerCase();
    const customerName = appointment.customer?.customerName?.toLowerCase() || '';
    const appointmentId = appointment._id?.toLowerCase() || '';
    const phone = appointment.customer?.phone?.toLowerCase() || '';
    
    return customerName.includes(searchLower) || 
           appointmentId.includes(searchLower) ||
           phone.includes(searchLower);
  });

  const filteredAppointmentsGoi = appointmentsGoi.filter(appointment => {
    const searchLower = searchText.toLowerCase();
    const customerName = appointment.customerDetails?.customerName?.toLowerCase() || '';
    const appointmentId = appointment._id?.toLowerCase() || '';
    const phone = appointment.customerDetails?.phone?.toLowerCase() || '';
    
    return customerName.includes(searchLower) || 
           appointmentId.includes(searchLower) ||
           phone.includes(searchLower);
  });

  const columnsLe = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: "Tên khách hàng",
      dataIndex: ["customer", "customerName"],
      key: "customerName",
      render: (text, record) => record.customer?.customerName || "N/A"
    },
    {
      title: "Số điện thoại",
      dataIndex: ["customer", "phone"],
      key: "phone",
      render: (text, record) => record.customer?.phone || "N/A"
    },
    {
      title: "Vaccine",
      dataIndex: ["vaccine", "vaccineName"],
      key: "vaccineName",
      render: (text, record) => record.vaccine?.vaccineName || "N/A"
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (text) => new Date(text).toLocaleDateString("vi-VN")
    },
    {
      title: "Giờ hẹn",
      dataIndex: "appointmentTime",
      key: "appointmentTime"
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
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Chưa hoàn thành", value: "incomplete" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã duyệt", value: "approve" }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            type="primary" 
            onClick={() => showAppointmentDetails(record, false)}
            style={{ marginRight: 8 }}
          >
            Chi tiết
          </Button>
          <Select
            defaultValue={record.status}
            style={{ width: 140 }}
            onChange={(value) => handleStatusChange(record._id, value, false)}
          >
            <Option value="pending">Đang chờ</Option>
            <Option value="approve">Đã duyệt</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="incomplete">Chưa hoàn thành</Option>
          </Select>
        </div>
      )
    }
  ];

  const columnsGoi = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: "Tên khách hàng",
      key: "customerName",
      render: (text, record) => record.customerDetails?.customerName || "N/A"
    },
    {
      title: "Số điện thoại",
      key: "phone",
      render: (text, record) => record.customerDetails?.phone || "N/A"
    },
    {
      title: "Gói vaccine",
      dataIndex: "packageName",
      key: "packageName"
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "registrationDate",
      key: "registrationDate",
      render: (text) => text ? new Date(text).toLocaleDateString("vi-VN") : "N/A"
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
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Chưa hoàn thành", value: "incomplete" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã duyệt", value: "approve" }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            type="primary" 
            onClick={() => showAppointmentDetails(record, true)}
            style={{ marginRight: 8 }}
          >
            Chi tiết
          </Button>
          <Select
            defaultValue={record.status}
            style={{ width: 140 }}
            onChange={(value) => handleStatusChange(record._id, value, true)}
          >
            <Option value="pending">Đang chờ</Option>
            <Option value="approve">Đã duyệt</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="incomplete">Chưa hoàn thành</Option>
          </Select>
        </div>
      )
    }
  ];

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;
    
    const isPackage = selectedAppointment.isPackage;
    
    if (isPackage) {
      // Hiển thị chi tiết lịch hẹn gói
      return (
        <div className="appointment-details">
          <Title level={4}>Chi tiết lịch hẹn gói</Title>
          
          <div className="detail-row">
            <div className="detail-label">Mã lịch hẹn:</div>
            <div className="detail-value id-column">{selectedAppointment._id}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Tên khách hàng:</div>
            <div className="detail-value">{selectedAppointment.customerDetails?.customerName || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Số điện thoại:</div>
            <div className="detail-value">{selectedAppointment.customerDetails?.phone || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Địa chỉ:</div>
            <div className="detail-value">{selectedAppointment.customerDetails?.address || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Gói vaccine:</div>
            <div className="detail-value">{selectedAppointment.packageName || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Ngày đăng ký:</div>
            <div className="detail-value">
              {selectedAppointment.registrationDate 
                ? new Date(selectedAppointment.registrationDate).toLocaleDateString("vi-VN") 
                : "N/A"}
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Trạng thái:</div>
            <div className="detail-value">
              <Select
                value={selectedAppointment.status}
                style={{ width: 140 }}
                onChange={(value) => handleStatusChange(selectedAppointment._id, value, true)}
              >
                <Option value="pending">Đang chờ</Option>
                <Option value="approve">Đã duyệt</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="incomplete">Chưa hoàn thành</Option>
              </Select>
            </div>
          </div>
          
          <Title level={5} style={{ marginTop: 16 }}>Lịch tiêm các mũi</Title>
          
          {selectedAppointment.doseSchedule && selectedAppointment.doseSchedule.length > 0 ? (
            <List
              dataSource={selectedAppointment.doseSchedule}
              renderItem={item => (
                <Card 
                  size="small" 
                  title={`Mũi ${item.doseNumber}`} 
                  style={{ marginBottom: 8 }}
                  extra={
                    <Checkbox 
                      checked={item.status === "completed"} 
                      onChange={(e) => handleDoseStatusChange(
                        selectedAppointment._id, 
                        item.doseNumber, 
                        e.target.checked
                      )}
                    >
                      Đã tiêm
                    </Checkbox>
                  }
                >
                  <p><strong>Ngày hẹn:</strong> {new Date(item.appointmentDate).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Giờ hẹn:</strong> {item.appointmentTime}</p>
                  <p>
                    <strong>Trạng thái:</strong> 
                    <Tag 
                      color={getStatusColor(item.status)} 
                      style={{ marginLeft: 8 }}
                    >
                      {getStatusText(item.status)}
                    </Tag>
                  </p>
                </Card>
              )}
            />
          ) : (
            <Text type="secondary">Không có thông tin lịch tiêm</Text>
          )}
          
        </div>
      );
    } else {
      // Hiển thị chi tiết lịch hẹn lẻ
      return (
        <div className="appointment-details">
          <Title level={4}>Chi tiết lịch hẹn lẻ</Title>
          
          <div className="detail-row">
            <div className="detail-label">Mã lịch hẹn:</div>
            <div className="detail-value id-column">{selectedAppointment._id}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Tên khách hàng:</div>
            <div className="detail-value">{selectedAppointment.customer?.customerName || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Số điện thoại:</div>
            <div className="detail-value">{selectedAppointment.customer?.phone || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Địa chỉ:</div>
            <div className="detail-value">{selectedAppointment.customer?.address || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Vaccine:</div>
            <div className="detail-value">{selectedAppointment.vaccine?.vaccineName || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Ngày hẹn:</div>
            <div className="detail-value">
              {selectedAppointment.appointmentDate 
                ? new Date(selectedAppointment.appointmentDate).toLocaleDateString("vi-VN") 
                : "N/A"}
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Giờ hẹn:</div>
            <div className="detail-value">{selectedAppointment.appointmentTime || "N/A"}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Trạng thái:</div>
            <div className="detail-value">
              <Select
                value={selectedAppointment.status}
                style={{ width: 140 }}
                onChange={(value) => handleStatusChange(selectedAppointment._id, value, false)}
              >
                <Option value="pending">Đang chờ</Option>
                <Option value="approve">Đã duyệt</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="incomplete">Chưa hoàn thành</Option>
              </Select>
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Ghi chú:</div>
            <div className="detail-value">{selectedAppointment.note || "Không có ghi chú"}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="appointment-management">
      <h1>Quản lý lịch hẹn</h1>
      
      <div className="search-container">
        <Input
          placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã lịch hẹn"
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Đang tải...
          </div>
        ) : (
          renderAppointmentDetails()
        )}
      </Modal>
    </div>
  );
};

export default AdminAppointmentManagement; 