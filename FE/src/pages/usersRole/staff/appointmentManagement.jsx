import { useState, useEffect } from "react";

import {
  Table,
  Tag,
  Button,
  message,
  Modal,
  Tabs,
  Input,
  List,
  Card,
  Typography,
} from "antd";
import {
  SearchOutlined,
  CheckCircleFilled,
  MenuOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axiosInstance from "../../../service/api";
import "./appointmentManagement.css";
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Thêm style cho nút duyệt và hủy đơn
const buttonStyles = `
  .approve-button {
    background-color: #1976d2 !important;
    border-color: #1976d2 !important;
    margin-right: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
  }
  
  .approve-button:hover:not(:disabled) {
    background-color: #1565c0 !important;
    border-color: #1565c0 !important;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  }
  
  .approve-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .complete-button {
    background-color: #52c41a ;
    border-color: #52c41a ;
    margin-right: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
  }
  
  .complete-button:hover:not(:disabled) {
    background-color: #389e0d ;
    border-color: #389e0d ;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  }
  
  .complete-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .cancel-button {
    background-color: #f44336 ;
    border-color: #f44336 ;
    color: white ;
    transition: all 0.3s ease;
    box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
  }
  
  .cancel-button:hover:not(:disabled) {
    background-color: #d32f2f ;
    border-color: #d32f2f !;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
  }
  
  .cancel-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
`;

const AppointmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [appointmentsLe, setAppointmentsLe] = useState([]);
  const [appointmentsGoi, setAppointmentsGoi] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [detailLoading, setDetailLoading] = useState(false);

  // Thêm style vào component
  useEffect(() => {
    // Tạo style element
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.innerHTML = buttonStyles;
    document.head.appendChild(styleElement);

    // Cleanup khi component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accesstoken");

      // Fetch appointments lẻ
      const responseLe = await axiosInstance.get(
        "/appointmentLe/getdetailallaptle",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch appointments gói - sử dụng API chi tiết
      const responseGoi = await axiosInstance.get(
        "/appointmentGoi/showDetailAptGoi",
        {
          headers: { Authorization: `Bearer ${token}` },
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

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "incomplete":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "incomplete":
        return "Đã hủy";
      case "pending":
        return "Đang chờ";
      default:
        return "Không xác định";
    }
  };

  const handleStatusChange = async (id, status, isPackage) => {
    try {
      const token = localStorage.getItem("accesstoken");
      const endpoint = isPackage
        ? `/appointmentGoi/update/${id}`
        : `/appointmentLe/update/${id}`;

      await axiosInstance.post(
        endpoint,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let successMessage = "";
      if (status === "completed") {
        successMessage = "Đã hoàn thành đơn thành công";
      } else if (status === "incomplete") {
        successMessage = "Đã hủy đơn thành công";
      } else {
        successMessage = "Đã cập nhật trạng thái đơn thành công";
      }

      message.success(successMessage);
      fetchAppointments();

      if (
        isModalVisible &&
        selectedAppointment &&
        selectedAppointment._id === id
      ) {
        setSelectedAppointment({
          ...selectedAppointment,
          status,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);

      let errorMessage = "";
      if (status === "completed") {
        errorMessage = "Không thể hoàn thành đơn";
      } else if (status === "incomplete") {
        errorMessage = "Không thể hủy đơn";
      } else {
        errorMessage = "Không thể cập nhật trạng thái đơn";
      }

      message.error(errorMessage);
    }
  };

  const handleDoseStatusChange = async (
    appointmentId,
    doseNumber,
    completed
  ) => {
    try {
      const token = localStorage.getItem("accesstoken");

      // Convert boolean to status string
      const status = completed ? "completed" : "pending";

      console.log("Updating dose status:", {
        appointmentId,
        doseNumber,
        status,
      });

      // Make API call to update dose status
      const response = await axiosInstance.post(
        `/appointmentGoi/updateDose/${appointmentId}`,
        {
          doseNumber: parseInt(doseNumber),
          status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API response:", response.data);

      if (response.data) {
        message.success(`Cập nhật trạng thái mũi ${doseNumber} thành công`);

        // Update the UI immediately
        if (selectedAppointment && selectedAppointment._id === appointmentId) {
          // Create a new dose schedule array with the updated status
          const updatedDoseSchedule = selectedAppointment.doseSchedule.map(
            (dose) => {
              if (dose.doseNumber === parseInt(doseNumber)) {
                console.log(
                  `Updating dose ${doseNumber} from ${dose.status} to ${status}`
                );
                return { ...dose, status };
              }
              return dose;
            }
          );

          console.log("Updated dose schedule:", updatedDoseSchedule);

          // Update the selected appointment state with the new dose schedule
          setSelectedAppointment({
            ...selectedAppointment,
            doseSchedule: updatedDoseSchedule,
          });

          // Kiểm tra xem tất cả các mũi tiêm đã hoàn thành chưa
          const allDosesCompleted = updatedDoseSchedule.every(
            (dose) => dose.status === "completed"
          );

          // Nếu tất cả các mũi tiêm đã hoàn thành và trạng thái hiện tại không phải là "completed"
          if (allDosesCompleted && selectedAppointment.status !== "completed") {
            console.log(
              "All doses completed, updating appointment status to completed"
            );

            // Cập nhật trạng thái lịch hẹn thành "completed"
            await handleStatusChange(appointmentId, "completed", true);

            // Hiển thị thông báo
            message.success(
              "Tất cả các mũi tiêm đã hoàn thành, lịch hẹn đã được cập nhật thành Hoàn thành"
            );
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
        message.error(
          `Không thể cập nhật trạng thái mũi ${doseNumber}: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.log("Error request:", error.request);
        message.error(
          `Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.`
        );
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
      sorter: (a, b) => {
        // Hàm chuyển đổi chuỗi ngày thành đối tượng Date
        const parseDate = (dateStr) => {
          // Thử các định dạng khác nhau
          const formats = [
            "DD/MM/YYYY",
            "YYYY-MM-DD",
            "MM/DD/YYYY",
            "DD-MM-YYYY",
          ];

          for (const format of formats) {
            const date = moment(dateStr, format, true);
            if (date.isValid()) {
              return date;
            }
          }

          // Nếu không khớp với bất kỳ định dạng nào, thử chuyển đổi trực tiếp
          return moment(new Date(dateStr));
        };

        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);

        return dateA - dateB;
      },
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã hủy", value: "incomplete" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          {record.status === "pending" && (
            <Button
              type="primary"
              className="complete-button"
              onClick={() => handleStatusChange(record._id, "completed", false)}
              disabled={record.status === "incomplete" || record.status === "completed"}
            >
              Hoàn thành
            </Button>
          )}
          <Button
            danger
            className="cancel-button"
            onClick={() => handleStatusChange(record._id, "incomplete", false)}
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
          onClick={() => showAppointmentDetails(record, false)}
          disabled={record.status === "incomplete"}
        />
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
          record.customer?.customerName ||
          record.customerDetails?.customerName ||
          cusId?.customerName ||
          cusId?.name ||
          (typeof cusId === "string" ? cusId : "N/A");

        return customerName;
      },
    },
    {
      title: "Gói vaccine",
      dataIndex: "vaccinePakageId",
      key: "vaccinePakageId",
      render: (pkg, record) => {
        // Try to get package name from all possible sources
        const packageName =
          record.package?.packageName ||
          record.vaccinePakage?.packageName ||
          record.packageDetails?.packageName ||
          pkg?.packageName ||
          pkg?.name ||
          (typeof pkg === "string" ? pkg : "N/A");

        console.log("Vaccine Package Data:", {
          package: record.package,
          vaccinePakage: record.vaccinePakage,
          packageDetails: record.packageDetails,
          pkg: pkg,
        });

        return packageName;
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => {
        // Hàm chuyển đổi chuỗi ngày thành đối tượng Date
        const parseDate = (dateStr) => {
          // Thử các định dạng khác nhau
          const formats = [
            "DD/MM/YYYY",
            "YYYY-MM-DD",
            "MM/DD/YYYY",
            "DD-MM-YYYY",
          ];

          for (const format of formats) {
            const date = moment(dateStr, format, true);
            if (date.isValid()) {
              return date;
            }
          }

          // Nếu không khớp với bất kỳ định dạng nào, thử chuyển đổi trực tiếp
          return moment(new Date(dateStr));
        };

        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);

        return dateA - dateB;
      },
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã hủy", value: "incomplete" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          {record.status === "pending" && (
            <Button
              type="primary"
              className="complete-button"
              onClick={() => handleStatusChange(record._id, "completed", true)}
              disabled={record.status === "incomplete" || record.status === "completed"}
            >
              Hoàn thành
            </Button>
          )}
          <Button
            danger
            className="cancel-button"
            onClick={() => handleStatusChange(record._id, "incomplete", true)}
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
          onClick={() => showAppointmentDetails(record, true)}
          disabled={record.status === "incomplete"}
        />
      ),
    },
  ];

  const filteredAppointmentsLe = appointmentsLe.filter(
    (apt) =>
      apt._id?.toLowerCase().includes(searchText.toLowerCase()) ||
      (
        apt.customer?.customerName ||
        apt.cusId?.customerName ||
        apt.cusId?.name ||
        ""
      )
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (
        apt.vaccine?.vaccineName ||
        apt.vaccineId?.vaccineName ||
        apt.vaccineId?.name ||
        ""
      )
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      apt.date?.toLowerCase().includes(searchText.toLowerCase()) ||
      apt.status?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredAppointmentsGoi = appointmentsGoi.filter(
    (apt) =>
      apt._id?.toLowerCase().includes(searchText.toLowerCase()) ||
      (
        apt.customer?.customerName ||
        apt.customerDetails?.customerName ||
        apt.cusId?.customerName ||
        apt.cusId?.name ||
        ""
      )
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (
        apt.package?.packageName ||
        apt.vaccinePakage?.packageName ||
        apt.packageDetails?.packageName ||
        apt.vaccinePakageId?.packageName ||
        apt.vaccinePakageId?.name ||
        ""
      )
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
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
          </Button>,
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
                  ? selectedAppointment.customer?.customerName ||
                    selectedAppointment.customerDetails?.customerName ||
                    selectedAppointment.cusId?.customerName ||
                    selectedAppointment.cusId?.name ||
                    (typeof selectedAppointment.cusId === "string"
                      ? selectedAppointment.cusId
                      : "N/A")
                  : selectedAppointment.customer?.customerName ||
                    selectedAppointment.cusId?.customerName ||
                    selectedAppointment.cusId?.name ||
                    (selectedAppointment.cusId
                      ? selectedAppointment.cusId.toString()
                      : "N/A")}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Số điện thoại:</span>
              <span className="detail-value">
                {selectedAppointment.isPackage
                  ? selectedAppointment.customer?.phone ||
                    selectedAppointment.customerDetails?.phone ||
                    selectedAppointment.cusId?.phone ||
                    "N/A"
                  : selectedAppointment.customer?.phone ||
                    selectedAppointment.cusId?.phone ||
                    "N/A"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Địa chỉ:</span>
              <span className="detail-value">
                {selectedAppointment.isPackage
                  ? selectedAppointment.customer?.address ||
                    selectedAppointment.customerDetails?.address ||
                    selectedAppointment.cusId?.address ||
                    "N/A"
                  : selectedAppointment.customer?.address ||
                    selectedAppointment.cusId?.address ||
                    "N/A"}
              </span>
            </div>
            {selectedAppointment.childId && (
              <div className="detail-row">
                <span className="detail-label">Trẻ em:</span>
                <span className="detail-value">
                  {selectedAppointment.childId.childName ||
                    selectedAppointment.childId.toString()}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">
                {selectedAppointment.isPackage ? "Gói vaccine:" : "Vaccine:"}
              </span>
              <span className="detail-value">
                {selectedAppointment.isPackage
                  ? selectedAppointment.package?.packageName ||
                    selectedAppointment.vaccinePakage?.packageName ||
                    selectedAppointment.packageDetails?.packageName ||
                    selectedAppointment.vaccinePakageId?.packageName ||
                    selectedAppointment.vaccinePakageId?.name ||
                    (selectedAppointment.vaccinePakageId
                      ? selectedAppointment.vaccinePakageId.toString()
                      : "N/A")
                  : selectedAppointment.vaccine?.vaccineName ||
                    selectedAppointment.vaccineId?.vaccineName ||
                    selectedAppointment.vaccineId?.name ||
                    "N/A"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngày hẹn:</span>
              <span className="detail-value">{selectedAppointment.date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngày tạo:</span>
              <span className="detail-value">
                {selectedAppointment.createAt}
              </span>
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
            {selectedAppointment.isPackage &&
              selectedAppointment.doseSchedule &&
              selectedAppointment.doseSchedule.length > 0 && (
                <div className="dose-schedule-section">
                  <Title level={5}>
                    Lịch tiêm các mũi
                  </Title>
                  <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={selectedAppointment.doseSchedule}
                    renderItem={(item) => (
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
                          <div className="dose-detail-row dose-actions">
                            <Button
                              type={
                                item.status === "completed"
                                  ? "primary"
                                  : "default"
                              }
                              icon={
                                item.status === "completed" ? (
                                  <CheckCircleFilled />
                                ) : null
                              }
                              onClick={() => {
                                const newStatus =
                                  item.status === "completed"
                                    ? "pending"
                                    : "completed";
                                console.log(
                                  `Toggling status for dose ${item.doseNumber} from ${item.status} to ${newStatus}`
                                );
                                handleDoseStatusChange(
                                  selectedAppointment._id,
                                  item.doseNumber,
                                  newStatus === "completed"
                                );
                              }}
                              className={
                                item.status === "completed"
                                  ? "complete-dose-button"
                                  : "mark-complete-button"
                              }
                            >
                              {item.status === "completed"
                                ? "Đã hoàn thành"
                                : "Đánh dấu hoàn thành"}
                            </Button>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                </div>
              )}
          </div>
        ) : (
          <div className="loading-details">Đang tải thông tin chi tiết...</div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;
