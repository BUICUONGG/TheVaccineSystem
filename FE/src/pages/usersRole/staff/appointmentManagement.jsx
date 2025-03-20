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
  Divider,
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
  const [appointmentsGoi, setAppointmentsGoi] = useState([]);
  const [appointmentsLe, setAppointmentsLe] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [detailLoading, setDetailLoading] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [filteredAppointmentsGoi, setFilteredAppointmentsGoi] = useState([]);
  const [filteredAppointmentsLe, setFilteredAppointmentsLe] = useState([]);

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

      // Fetch appointments gói - sử dụng API chi tiết
      const responseGoi = await axiosInstance.get(
        "/appointmentGoi/showDetailAptGoi",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch appointments lẻ - sử dụng API chi tiết
      const responseLe = await axiosInstance.get(
        "/appointmentLe/getdetailallaptle",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Console log to debug
      console.log("Appointment data:", {
        firstRecord: responseGoi.data?.[0],
        createAtExists: responseGoi.data?.[0]?.createAt ? true : false,
        createdAtExists: responseGoi.data?.[0]?.createdAt ? true : false,
      });

      // Không cần fetch thêm thông tin nếu API đã trả về đầy đủ
      setAppointmentsGoi(responseGoi.data || []);
      setAppointmentsLe(responseLe.data || []);
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
      case "Pending":
      case "pending":
        return "orange";
      case "Paid":
        return "blue";
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
        return "Đã hủy";
      case "Pending":
        return "Đang chờ";
      case "Paid":
        return "Đã thanh toán";
      case "approve":
        return "Đã duyệt";
      default:
        return "Không xác định";
    }
  };

  const getDoseStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Đã tiêm";
      case "pending":
        return "Chưa tiêm";
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
        message.success(`${completed ? "Đánh dấu đã tiêm" : "Hủy đánh dấu"} mũi ${doseNumber} thành công`);

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

  const showAppointmentDetails = async (record, isPackage = true) => {
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
      width: 150,
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
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
      width: 110,
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
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price) => price ? price.toLocaleString("vi-VN") + " VNĐ" : "N/A",
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Số mũi tiêm",
      dataIndex: "doseSchedule",
      key: "doseCount",
      width: 100,
      render: (doseSchedule) => doseSchedule?.length || 0,
    },
    {
      title: "Tiến độ",
      dataIndex: "doseSchedule",
      key: "doseProgress",
      width: 120,
      render: (doseSchedule) => {
        if (!doseSchedule || doseSchedule.length === 0) return "N/A";
        
        const completedDoses = doseSchedule.filter(
          (dose) => dose.status === "completed"
        ).length;
        
        const totalDoses = doseSchedule.length;
        const progressPercent = Math.round((completedDoses / totalDoses) * 100);
        
        // Hiển thị tiến độ với màu sắc khác nhau dựa trên phần trăm hoàn thành
        let color = "default";
        if (progressPercent === 100) color = "green";
        else if (progressPercent > 50) color = "blue";
        else if (progressPercent > 0) color = "orange";
        
        return (
          <div>
            <Tag color={color} style={{ minWidth: '70px', textAlign: 'center' }}>
              {completedDoses}/{totalDoses} mũi
            </Tag>
            {progressPercent === 100 && (
              <span style={{ marginLeft: '5px', color: 'green', fontSize: '12px' }}>
                ✓ Hoàn thành
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã hủy", value: "incomplete" },
        { text: "Đã duyệt", value: "approve" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Chi tiết",
      key: "details",
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<MenuOutlined />}
          onClick={() => showAppointmentDetails(record)}
          disabled={record.status === "incomplete"}
        />
      ),
    },
  ];

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
      width: 150,
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
      title: "Vaccine",
      dataIndex: "vaccineId",
      key: "vaccineId",
      width: 150,
      render: (vaccineId, record) => {
        // Try to get vaccine name from all possible sources
        const vaccineName =
          record.vaccine?.vaccineName ||
          record.vaccineDetails?.vaccineName ||
          vaccineId?.vaccineName ||
          vaccineId?.name ||
          (typeof vaccineId === "string" ? vaccineId : "N/A");

        return vaccineName;
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
      width: 110,
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
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price) => price ? price.toLocaleString("vi-VN") + " VNĐ" : "N/A",
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã hủy", value: "incomplete" },
        { text: "Đã duyệt", value: "approve" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="action-buttons">
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                className="approve-button"
                onClick={() => handleStatusChange(record._id, "approve", false)}
              >
                Duyệt đơn
              </Button>
              <Button
                danger
                className="cancel-button"
                onClick={() => handleStatusChange(record._id, "incomplete", false)}
              >
                Hủy đơn
              </Button>
            </>
          )}
          {record.status === "approve" && (
            <Button
              type="primary"
              className="complete-button"
              onClick={() => handleStatusChange(record._id, "completed", false)}
            >
              Hoàn thành
            </Button>
          )}
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => showAppointmentDetails(record, false)}
            disabled={record.status === "incomplete"}
            style={{ marginLeft: '8px' }}
          />
        </div>
      ),
    },
  ];

  // Add useEffect hook for real-time filtering
  useEffect(() => {
    if (!searchText || searchText.trim() === '') {
      setFilteredAppointmentsGoi(appointmentsGoi);
      setFilteredAppointmentsLe(appointmentsLe);
      return;
    }
    
    const filteredGoi = appointmentsGoi.filter(
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
        apt.status?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.price?.toString().includes(searchText.toLowerCase()) ||
        apt.time?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.createdAt?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.createAt?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.note?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.app_trans_id?.toLowerCase().includes(searchText.toLowerCase())
    );

    const filteredLe = appointmentsLe.filter(
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
          apt.vaccine?.vaccineName ||
          apt.vaccineDetails?.vaccineName ||
          apt.vaccineId?.vaccineName ||
          apt.vaccineId?.name ||
          ""
        )
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        apt.date?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.status?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.price?.toString().includes(searchText.toLowerCase()) ||
        apt.time?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.createdAt?.toLowerCase().includes(searchText.toLowerCase()) ||
        apt.note?.toLowerCase().includes(searchText.toLowerCase())
    );
    
    setFilteredAppointmentsGoi(filteredGoi);
    setFilteredAppointmentsLe(filteredLe);
  }, [appointmentsGoi, appointmentsLe, searchText]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Hàm kiểm tra và cập nhật trạng thái cho các đơn hẹn quá hạn
  const checkExpiredAppointments = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const today = moment().startOf('day');
      let updateCounter = 0;
      
      // Kiểm tra đơn hẹn gói quá hạn
      for (const apt of appointmentsGoi) {
        if (apt.status === "pending") {
          const appointmentDate = moment(apt.date, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"]);
          
          if (appointmentDate.isValid() && appointmentDate.isBefore(today)) {
            await axiosInstance.post(
              `/appointmentGoi/update/${apt._id}`,
              { status: "incomplete" },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCounter++;
          }
        }
      }
      
      // Kiểm tra đơn hẹn lẻ quá hạn
      for (const apt of appointmentsLe) {
        if (apt.status === "pending") {
          const appointmentDate = moment(apt.date, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"]);
          
          if (appointmentDate.isValid() && appointmentDate.isBefore(today)) {
            await axiosInstance.post(
              `/appointmentLe/update/${apt._id}`,
              { status: "incomplete" },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCounter++;
          }
        }
      }
      
      if (updateCounter > 0) {
        message.info(`Đã tự động hủy ${updateCounter} đơn hẹn quá hạn`);
        fetchAppointments(); // Cập nhật lại danh sách sau khi thay đổi
      }
    } catch (error) {
      console.error("Error checking expired appointments:", error);
    }
  };

  // Chạy kiểm tra khi component được tải và mỗi khi danh sách lịch hẹn thay đổi
  useEffect(() => {
    if (autoCheckEnabled && (appointmentsGoi.length > 0 || appointmentsLe.length > 0)) {
      checkExpiredAppointments();
    }
  }, [appointmentsGoi, appointmentsLe, autoCheckEnabled]);

  return (
    <div className="appointment-management">
      <h1>Quản lý lịch hẹn</h1>

      <div className="search-container">
        <Input
          placeholder="Tìm kiếm lịch hẹn..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          className="search-input"
          allowClear
        />
        <Button 
          type={autoCheckEnabled ? "primary" : "default"}
          onClick={() => setAutoCheckEnabled(!autoCheckEnabled)}
          style={{ marginLeft: '16px' }}
        >
          {autoCheckEnabled ? "Tắt tự động hủy" : "Bật tự động hủy"}
        </Button>
        <Button 
          onClick={checkExpiredAppointments} 
          style={{ marginLeft: '8px' }}
        >
          Kiểm tra đơn quá hạn
        </Button>
      </div>

      <Tabs defaultActiveKey="1" onChange={(key) => setActiveTab(key)}>
        <TabPane tab="Lịch hẹn gói" key="1">
          <Table
            columns={columnsGoi}
            dataSource={filteredAppointmentsGoi}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Lịch hẹn lẻ" key="2">
          <Table
            columns={columnsLe}
            dataSource={filteredAppointmentsLe}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={selectedAppointment?.isPackage ? "Chi tiết lịch hẹn gói" : "Chi tiết lịch hẹn lẻ"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
        confirmLoading={detailLoading}
      >
        {selectedAppointment && !detailLoading ? (
          <div className="appointment-details">
            <div className="detail-section">
              <Title level={4}>Thông tin cơ bản</Title>
              <div className="detail-row">
                <span className="detail-label">Mã đơn:</span>
                <span className="detail-value">{selectedAppointment._id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Khách hàng:</span>
                <span className="detail-value">
                  {selectedAppointment.customer?.customerName ||
                    selectedAppointment.customerDetails?.customerName ||
                    selectedAppointment.cusId?.customerName ||
                    selectedAppointment.cusId?.name ||
                    (typeof selectedAppointment.cusId === "string"
                      ? selectedAppointment.cusId
                      : "N/A")}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">
                  {selectedAppointment.customer?.phone ||
                    selectedAppointment.customerDetails?.phone ||
                    selectedAppointment.cusId?.phone ||
                    "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Địa chỉ:</span>
                <span className="detail-value">
                  {selectedAppointment.customer?.address ||
                    selectedAppointment.customerDetails?.address ||
                    selectedAppointment.cusId?.address ||
                    "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trẻ em:</span>
                <span className="detail-value">
                  {selectedAppointment.childId ? 
                    (selectedAppointment.childId.childName ||
                      selectedAppointment.child?.childName ||
                      selectedAppointment.childId.toString()) : "Không có"}
                </span>
              </div>
              
              {selectedAppointment.isPackage ? (
                <div className="detail-row">
                  <span className="detail-label">Gói vaccine:</span>
                  <span className="detail-value">
                    {selectedAppointment.package?.packageName ||
                      selectedAppointment.vaccinePakage?.packageName ||
                      selectedAppointment.packageDetails?.packageName ||
                      selectedAppointment.vaccinePackageId?.packageName ||
                      selectedAppointment.vaccinePakageId?.name ||
                      (selectedAppointment.vaccinePackageId
                        ? selectedAppointment.vaccinePackageId.toString()
                        : "N/A")}
                  </span>
                </div>
              ) : (
                <div className="detail-row">
                  <span className="detail-label">Vaccine:</span>
                  <span className="detail-value">
                    {selectedAppointment.vaccine?.vaccineName ||
                      selectedAppointment.vaccineDetails?.vaccineName ||
                      selectedAppointment.vaccineId?.vaccineName ||
                      selectedAppointment.vaccineId?.name ||
                      (typeof selectedAppointment.vaccineId === "string"
                        ? selectedAppointment.vaccineId
                        : "N/A")}
                  </span>
                </div>
              )}
              
              {!selectedAppointment.isPackage && (
                <div className="detail-row">
                  <span className="detail-label">Lô vaccine:</span>
                  <span className="detail-value">
                    {selectedAppointment.batch?.importCode ||
                      selectedAppointment.batchDetails?.importCode ||
                      selectedAppointment.batchId?.importCode ||
                      selectedAppointment.batchId?.toString() ||
                      "N/A"}
                  </span>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Ngày hẹn:</span>
                <span className="detail-value">{selectedAppointment.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Thời gian:</span>
                <span className="detail-value">{selectedAppointment.time || "Chưa xác định"}</span>
              </div>
              <div className="detail-row highlight-info">
                <span className="detail-label">Giá tiền:</span>
                <span className="detail-value">
                  {selectedAppointment.price
                    ? selectedAppointment.price.toLocaleString("vi-VN") + " VNĐ"
                    : "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ngày tạo:</span>
                <span className="detail-value">
                  {selectedAppointment.createdAt || selectedAppointment.createAt || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ghi chú:</span>
                <span className="detail-value">
                  {selectedAppointment.note || "Không có ghi chú"}
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
              {selectedAppointment.app_trans_id && (
                <div className="detail-row">
                  <span className="detail-label">Mã giao dịch:</span>
                  <span className="detail-value">
                    {selectedAppointment.app_trans_id}
                  </span>
                </div>
              )}

              {!selectedAppointment.isPackage && selectedAppointment.status !== "completed" && (
                <div className="detail-row" style={{ marginTop: "20px" }}>
                  <span className="detail-label">Thao tác:</span>
                  <span className="detail-value">
                    <div className="action-buttons">
                      {selectedAppointment.status === "Pending" && (
                        <>
                          <Button
                            type="primary"
                            className="approve-button"
                            onClick={() => handleStatusChange(selectedAppointment._id, "approve", false)}
                          >
                            Duyệt đơn
                          </Button>
                          <Button
                            danger
                            className="cancel-button"
                            onClick={() => handleStatusChange(selectedAppointment._id, "incomplete", false)}
                          >
                            Hủy đơn
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === "approve" && (
                        <Button
                          type="primary"
                          className="complete-button"
                          onClick={() => handleStatusChange(selectedAppointment._id, "completed", false)}
                        >
                          Hoàn thành
                        </Button>
                      )}
                    </div>
                  </span>
                </div>
              )}
            </div>

            {/* Hiển thị lịch tiêm cho từng mũi - chỉ cho lịch hẹn gói */}
            {selectedAppointment.isPackage && selectedAppointment.doseSchedule &&
              selectedAppointment.doseSchedule.length > 0 && (
                <div className="dose-schedule-section">
                  <div className="dose-header">
                    <Title level={4}>Lịch tiêm các mũi</Title>
                    <div className="dose-progress-summary">
                      {(() => {
                        const totalDoses = selectedAppointment.doseSchedule.length;
                        const completedDoses = selectedAppointment.doseSchedule.filter(
                          dose => dose.status === "completed"
                        ).length;
                        const progressPercent = Math.round((completedDoses / totalDoses) * 100);
                        
                        let color = "#bfbfbf";
                        if (progressPercent === 100) color = "#52c41a";
                        else if (progressPercent > 50) color = "#1890ff";
                        else if (progressPercent > 0) color = "#faad14";
                        
                        return (
                          <>
                            <Tag color={color} style={{ marginRight: '5px' }}>
                              {completedDoses}/{totalDoses}
                            </Tag>
                            <span style={{ color: color, fontWeight: 'bold' }}>
                              {progressPercent}% đã tiêm
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
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
                              {getDoseStatusText(item.status)}
                            </Tag>
                          }
                        >
                          <div className="dose-detail-grid">
                          <div className="dose-detail-row">
                              <Text strong>Ngày tiêm:</Text> 
                              {item.date instanceof Date 
                                ? item.date.toLocaleDateString('vi-VN')
                                : item.date?.toString()}
                          </div>
                            <div className="dose-detail-row">
                              <Text strong>Vaccine:</Text> 
                              {(item.vaccineDetails?.vaccineName || 
                                item.vaccineId?.toString() || 
                                "Chưa xác định")}
                            </div>
                            <div className="dose-detail-row">
                              <Text strong>Lô vaccine:</Text> 
                              {(item.batchDetails?.importCode || 
                                item.batchId?.toString() || 
                                "Chưa xác định")}
                            </div>
                            <div className="dose-detail-row">
                              <Text strong>Đơn giá:</Text> 
                              {item.price ? item.price.toLocaleString('vi-VN') + ' VNĐ' : 'Chưa xác định'}
                            </div>
                          </div>
                          <Divider style={{ margin: '12px 0' }} />
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
                                    ? "Pending"
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
                                ? "Đã tiêm xong"
                                : "Đánh dấu đã tiêm"}
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
