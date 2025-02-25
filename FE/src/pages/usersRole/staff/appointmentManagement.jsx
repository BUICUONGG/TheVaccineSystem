import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tag, Button, Select, message, Modal, Tabs, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./appointmentManagement.css";

const { Option } = Select;
const { TabPane } = Tabs;

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
      title: "Mã lịch hẹn",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <span className="id-column">{id.substring(0, 8)}...</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "cusId",
      key: "cusId",
      render: (cusId, record) => {
        if (record.customer?.customerName) return record.customer.customerName;
        if (cusId?.customerName) return cusId.customerName;
        if (cusId?.name) return cusId.name;
        return cusId ? cusId.toString().substring(0, 8) + "..." : "N/A";
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
      title: "Mã lịch hẹn",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <span className="id-column">{id.substring(0, 8)}...</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "cusId",
      key: "cusId",
      render: (cusId, record) => {
        if (record.customerDetails?.customerName) return record.customerDetails.customerName;
        return cusId ? cusId.toString().substring(0, 8) + "..." : "N/A";
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
          <Select
            defaultValue={record.status}
            style={{ width: 140, marginLeft: 8 }}
            onChange={(value) => handleStatusChange(record._id, value, true)}
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
            <div className="detail-row">
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