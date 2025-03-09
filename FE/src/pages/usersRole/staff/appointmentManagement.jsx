import { useState, useEffect } from "react";
// import axios from "axios";
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
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  CheckCircleFilled,
  MenuOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axiosInstance from "../../../service/api";
import "./appointmentManagement.css";

// const { Option } = Select;
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

      message.success(
        `Đã ${status === "completed" ? "duyệt" : "hủy"} đơn thành công`
      );
      fetchAppointments();

      // Cập nhật trạng thái trong modal nếu đang mở
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
      message.error(
        `Không thể ${status === "completed" ? "duyệt" : "hủy"} đơn`
      );
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
      title: isPackage ? "Gói vaccine" : "Vaccine",
      dataIndex: isPackage ? "vaccinePakageId" : "vaccineId",
      key: isPackage ? "vaccinePakageId" : "vaccineId",
      render: (value, record) => {
        if (isPackage) {
          return (
            record.package?.packageName ||
            record.vaccinePakage?.packageName ||
            record.packageDetails?.packageName ||
            value?.packageName ||
            value?.name ||
            (typeof value === "string" ? value : "N/A")
          );
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
        // Parse dates using moment for reliable sorting
        const dateA = moment(a.date, "DD/MM/YYYY");
        const dateB = moment(b.date, "DD/MM/YYYY");
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
        { text: "Đã duyệt", value: "approve" },
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
          <Button
            type="primary"
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              marginRight: 8,
            }}
            onClick={() => handleStatusChange(record._id, "completed", false)}
          >
            Duyệt
          </Button>
          <Button
            danger
            onClick={() =>
              handleStatusChange(record._id, "incomplete", isPackage)
            }
            disabled={
              record.status === "incomplete" || record.status === "completed"
            }
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
          disabled={
            record.status === "incomplete" || record.status === "completed"
          }
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
        // Parse dates using moment for reliable sorting
        const dateA = moment(a.date, "DD/MM/YYYY");
        const dateB = moment(b.date, "DD/MM/YYYY");
        return dateA - dateB;
      },
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="primary"
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              marginRight: 8,
            }}
            onClick={() => handleStatusChange(record._id, "completed", true)}
          >
            Duyệt
          </Button>
          <Button
            danger
            onClick={() => handleStatusChange(record._id, "incomplete", true)}
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
        {detailLoading ? (
          <div className="loading-details">Đang tải thông tin chi tiết...</div>
        ) : (
          renderAppointmentDetails()
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagement;
