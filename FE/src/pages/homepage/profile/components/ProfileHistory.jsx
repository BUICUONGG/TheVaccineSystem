import { useState, useEffect } from "react";
import { Table, Tag, Input, Modal, Button, Tabs, Descriptions, Collapse } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import "./ProfileHistory.css";
import { toast } from "react-toastify";
import axiosInstance from "../../../../service/api";

const { TabPane } = Tabs;

const ProfileHistory = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [aptLes, setAptLes] = useState([]);
  const [aptGois, setAptGois] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [vaccineList, setVaccineList] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAptLes(),
          fetchAptGois(),
          fetchVaccineList()
        ]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchAptLes = async () => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      const cusId = localStorage.getItem("cusId");

      const response = await axiosInstance.get(
        `/appointmentLe/showInfo`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` }
        }
      );

      // Lọc các đơn có cusId trùng với cusId trong localStorage
      const filteredAptLes = response.data.filter(apt =>
        apt.customer?._id === cusId || apt.customer === cusId
      );

      console.log("Dữ liệu đơn lẻ sau khi lọc:", filteredAptLes);
      setAptLes(filteredAptLes.map(apt => ({
        ...apt,
        type: "Tiêm lẻ"
      })));

    } catch (error) {
      console.error("Lỗi khi lấy đơn lẻ:", error);
      toast.error("Không thể tải lịch sử đơn lẻ");
    }
  };

  const fetchAptGois = async () => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      const cusId = localStorage.getItem("cusId");

      const response = await axiosInstance.get(
        `/appointmentGoi/showInfo`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` }
        }
      );

      // Lọc các đơn có cusId trùng với cusId trong localStorage
      const filteredAptGois = response.data.filter(apt =>
        // So sánh trực tiếp với cusId
        apt.cusId === cusId ||
        // Hoặc kiểm tra nếu cusId nằm trong customer object
        apt.customer?._id === cusId
      );

      console.log("Dữ liệu đơn gói sau khi lọc:", filteredAptGois);
      setAptGois(filteredAptGois.map(apt => ({
        ...apt,
        type: "Tiêm gói"
      })));

    } catch (error) {
      console.error("Lỗi khi lấy đơn gói:", error);
      toast.error("Không thể tải lịch sử đơn gói");
    }
  };

  useEffect(() => {
    const allAppointments = [...aptLes, ...aptGois];
    console.log("Tất cả đơn sau khi gộp:", allAppointments);
    setAppointments(allAppointments);
  }, [aptLes, aptGois]);

  const fetchVaccineList = async () => {
    try {
      const response = await axiosInstance.get("/vaccine/showInfo");
      if (response.data) {
        const vaccineMap = {};
        response.data.forEach((vaccine) => {
          vaccineMap[vaccine._id] = vaccine.vaccineName;
        });
        setVaccineList(vaccineMap);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vaccine:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#52c41a";
      case "incomplete":
        return "#ff4d4f";
      case "pending":
        return "#faad14";
      case "approve":
        return "#1890ff";
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

  const showModal = (record) => {
    setSelectedAppointment(record);
    setIsModalVisible(true);
  };

  const getFilteredAppointments = (tabKey) => {
    // Sắp xếp tất cả các đơn theo ngày đăng ký (sớm nhất lên đầu)
    let filtered = [...appointments];

    // Lọc theo tab
    if (tabKey === "pending") {
      filtered = filtered.filter(
        (apt) => apt.status?.toLowerCase() === "pending"
      );
    }

    // Lọc theo search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((apt) => {
        const name = !apt.child
          ? apt.customer?.customerName
          : apt.child?.childName;
        return name?.toLowerCase().includes(searchLower);
      });
    }

    return filtered;
  };

  const renderModalContent = (appointment) => {
    if (!appointment) return null;

    // Chỉ render cho đơn tiêm lẻ
    if (!appointment.vaccinePackageId) {
      return (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã đơn">
            {appointment._id}
          </Descriptions.Item>

          <Descriptions.Item label="Loại tiêm">
            <Tag color="#108ee9">Tiêm lẻ</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Người tiêm">
            <Collapse ghost>
              <Collapse.Panel
                header={appointment.childId?.name || "Không có thông tin"}
                key="1"
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Ngày sinh">
                    {appointment.childId?.birthday || "Chưa có thông tin"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới tính">
                    {appointment.childId?.gender === 'male' ? 'Nam' : 'Nữ'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú sức khỏe">
                    {appointment.childId?.healthNote || "Không có ghi chú"}
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>
            </Collapse>
          </Descriptions.Item>

          <Descriptions.Item label="Tên vaccine">
            {vaccineList[appointment.vaccineId] || "Chưa có thông tin"}
          </Descriptions.Item>

          <Descriptions.Item label="Thuộc lô">
            {appointment.batchId || "Chưa có thông tin"}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tiêm">
            {appointment.date || "Chưa có thông tin"}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {appointment.createdAt || "Chưa có thông tin"}
          </Descriptions.Item>

          <Descriptions.Item label="Giá tiêm">
            {appointment.price ? `${appointment.price.toLocaleString('vi-VN')} VNĐ` : "Chưa có thông tin"}
          </Descriptions.Item>

          <Descriptions.Item label="Ghi chú">
            {appointment.note || "Không có ghi chú"}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      );
    }

    // Tạm thời return null cho đơn tiêm gói
    return (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã đơn">
          {appointment._id}
        </Descriptions.Item>

        <Descriptions.Item label="Loại tiêm">
          <Tag color="#87d068">Tiêm gói</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Người tiêm">
          <Collapse ghost>
            <Collapse.Panel
              header={appointment.childId?.name || "Không có thông tin"}
              key="1"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Ngày sinh">
                  {appointment.childId?.birthday || "Chưa có thông tin"}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {appointment.childId?.gender === 'male' ? 'Nam' : 'Nữ'}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú sức khỏe">
                  {appointment.childId?.healthNote || "Không có ghi chú"}
                </Descriptions.Item>
              </Descriptions>
            </Collapse.Panel>
          </Collapse>
        </Descriptions.Item>

        <Descriptions.Item label="Gói vaccine">
          {appointment.vaccinePackageId || "Chưa có thông tin"}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tiêm">
          {appointment.date || "Chưa có thông tin"}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {appointment.createdAt || "Chưa có thông tin"}
        </Descriptions.Item>

        <Descriptions.Item label="Chi tiết các mũi tiêm">
          <Collapse>
            {appointment.doseSchedule?.map((dose, index) => (
              <Collapse.Panel
                key={index}
                header={`Mũi ${dose.doseNumber}`}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Ngày tiêm">
                    {dose.date || "Chưa có thông tin"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên vaccine">
                    {dose.vaccineName || "Chưa có thông tin"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thuộc lô">
                    {dose.batchId || "Chưa có thông tin"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(dose.status)}>
                      {getStatusText(dose.status)}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>
            ))}
          </Collapse>
        </Descriptions.Item>

        <Descriptions.Item label="Giá gói vaccine">
          {appointment.price ? `${appointment.price.toLocaleString('vi-VN')} VNĐ` : "Chưa có thông tin"}
        </Descriptions.Item>

        <Descriptions.Item label="Ghi chú">
          {appointment.note || "Không có ghi chú"}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái đơn">
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
      title: "Ngày tạo đơn",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: sortedInfo.columnKey === "createdAt" && sortedInfo.order,
    },
    {
      title: "Người tiêm",
      key: "name",
      width: "25%",
      render: (_, record) => {
        const name = record.childId ? record.childId.name : record.customer?.customerName;
        return <div>{name}</div>;
      },
      sorter: (a, b) => {
        const nameA = a.childId ? a.childId.name : a.customer?.customerName;
        const nameB = b.childId ? b.childId.name : b.customer?.customerName;
        return nameA?.localeCompare(nameB);
      },
    },
    {
      title: "Loại tiêm",
      key: "type",
      width: "15%",
      render: (_, record) => (
        <Tag color={record.vaccinePackageId ? "#87d068" : "#108ee9"}>
          {record.vaccinePackageId ? "Tiêm gói" : "Tiêm lẻ"}
        </Tag>
      ),
    },
    {
      title: "Ngày tiêm",
      dataIndex: "date",
      key: "date",
      width: "15%",
    },
    {
      title: "Trạng thái",
      key: "status",
      width: "15%",
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => showModal(record)}
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
              {getFilteredAppointments("pending").length > 0 && (
                <Tag color="#faad14" className="tab-count">
                  {getFilteredAppointments("pending").length}
                </Tag>
              )}
            </span>
          }
          key="pending"
        >
          <Table
            columns={columns}
            dataSource={getFilteredAppointments("pending")}
            rowKey="_id"
            loading={loading}
            onChange={handleChange}
            pagination={{
              pageSize: 7,
              position: ["bottomCenter"],
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
            dataSource={getFilteredAppointments("others")}
            rowKey="_id"
            loading={loading}
            onChange={handleChange}
            pagination={{
              pageSize: 7,
              position: ["bottomCenter"],
              showSizeChanger: false,
            }}
            className="history-table"
          />
        </TabPane>
      </Tabs>

      <Modal
        title={`Chi tiết đơn ${selectedAppointment?.type || ""}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {renderModalContent(selectedAppointment)}
      </Modal>
    </div>
  );
};

export default ProfileHistory;
