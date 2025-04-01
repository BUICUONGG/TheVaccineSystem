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
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [vaccineList, setVaccineList] = useState({});
  const [vaccinePackageList, setVaccinePackageList] = useState({});
  const [batchData, setBatchData] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchAppointments();
    fetchVaccineList();
    fetchVaccinePackageList();
    fetchBatchData();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const cusId = localStorage.getItem("cusId");

      const response = await axiosInstance.post(
        `/customer/getAptleAndAptGoiByCusId/${cusId}`,
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      const aptLes = (response.data.aptLes || []).map((apt) => ({
        ...apt,
        type: "Tiêm lẻ",
      }));

      const aptGois = (response.data.aptGois || []).map((apt) => ({
        ...apt,
        type: "Tiêm gói",
      }));

      const allAppointments = [...aptLes, ...aptGois];
      setAppointments(allAppointments);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error("Không thể tải lịch sử đặt lịch");
    } finally {
      setLoading(false);
    }
  };

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

  const fetchVaccinePackageList = async () => {
    try {
      const response = await axiosInstance.get("/vaccinepakage/showVaccinePakage");
      if (response.data) {
        const packageMap = {};
        response.data.forEach((pkg) => {
          packageMap[pkg._id] = pkg.packageName;
        });
        setVaccinePackageList(packageMap);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin gói vaccine:", error);
    }
  };

  const fetchBatchData = async () => {
    try {
      const response = await axiosInstance.get("/vaccineImport/getFullData");
      if (response.data) {
        const batchMap = {};

        response.data.forEach((batch) => {
          batchMap[batch._id] = {
            batchNumber: batch.batchNumber,
            vaccines: batch.vaccines.reduce((acc, vaccine) => {
              acc[vaccine.vaccineId] = vaccine.expiryDate; // Lưu expiryDate theo vaccineId
              return acc;
            }, {})
          };
        });

        setBatchData(batchMap);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu vaccine:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#52c41a";  // Xanh lá - Đã tiêm xong
      case "incomplete":
        return "#ff4d4f";  // Đỏ - Đã hủy
      case "pending":
        return "#faad14";  // Vàng - Chưa thanh toán
      case "paid":
        return "#1890ff";  // Xanh dương - Đã thanh toán (chờ tiêm)
      case "approve":
        return "purple";  // Màu tím - Đã duyệt
      default:
        return "gray"; // Màu mặc định
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "ĐÃ TIÊM";
      case "incomplete":
        return "ĐÃ HỦY";
      case "pending":
        return "CHƯA THANH TOÁN";
      case "paid":
        return "ĐÃ THANH TOÁN";
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
    let filtered = [...appointments];

    if (tabKey === "pending") {

      filtered = filtered.filter(
        (apt) => apt.status?.toLowerCase() === "paid"
      );
    } else {

      filtered = filtered.filter(
        (apt) => apt.status?.toLowerCase() !== "paid"
      );
    }

    // Lọc theo search text nếu có
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((apt) => {
        const name = !apt.child
          ? apt.customer?.customerName
          : apt.child?.name;
        return name?.toLowerCase().includes(searchLower);
      });
    }

    return filtered;
  };

  const getParentRelation = (gender) => {
    return gender?.toLowerCase() === "male" ? "Cha" : "Mẹ";
  };

  const renderModalContent = (appointment) => {
    if (!appointment) return null;

    return (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã đơn">{appointment._id}</Descriptions.Item>
        <Descriptions.Item label="Loại tiêm">
          <Tag color={appointment.type === "Tiêm gói" ? "#87d068" : "#108ee9"}>
            {appointment.type}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Người tiêm">
          {!appointment.child || appointment.child === null ? (
            <div>
              <div>Người lớn: {appointment.customer?.customerName}</div>
              <Collapse ghost className="person-info-collapse">
                <Collapse.Panel header="Xem thông tin cá nhân" key="1">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày sinh">
                      {appointment.customer?.birthday || "Chưa có thông tin"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      {appointment.customer?.gender === 'male' ? 'Nam' : 'Nữ'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      {appointment.customer?.phone || "Chưa có thông tin"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {appointment.customer?.address || "Chưa có thông tin"}
                    </Descriptions.Item>
                  </Descriptions>
                </Collapse.Panel>
              </Collapse>
            </div>
          ) : (
            <div>
              <div>Trẻ: {appointment.child?.name}</div>
              <small style={{ color: "#666" }}>
                Người đăng ký: {getParentRelation(appointment.customer?.gender)} {appointment.customer?.customerName}
              </small>
              <Collapse ghost className="child-info-collapse">
                <Collapse.Panel header="Xem thông tin trẻ" key="1">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Ngày sinh">
                      {appointment.child?.birthday || "Chưa có thông tin"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                      {appointment.child?.gender === 'male' ? 'Nam' : 'Nữ'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú sức khỏe">
                      {appointment.child?.healthNote || "Không có ghi chú"}
                    </Descriptions.Item>
                  </Descriptions>
                </Collapse.Panel>
              </Collapse>
            </div>
          )}
        </Descriptions.Item>
        {appointment.type === "Tiêm gói" ? (
          <>
            <Descriptions.Item label="Tên gói vaccine">
              {vaccinePackageList[appointment.vaccinePackageId] || "Chưa có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Lịch tiêm theo gói">
              {appointment.doseSchedule?.map((dose, index) => (
                <div key={index} className="dose-schedule-item">
                  <h4>Mũi {dose.doseNumber}</h4>
                  <div className="dose-info">
                    <div>• Tên vaccine: {vaccineList[dose.vaccineId] || "Chưa có thông tin"}</div>
                    <div>• Ngày tiêm: {dose.date || "Chưa có thông tin"}</div>
                    <div>• Giá tiêm: {dose.price?.toLocaleString("vi-VN") || "0"} VNĐ</div>
                    <div>
                      • Trạng thái:
                      <Tag color={getStatusColor(dose.status)}>
                        {getStatusText(dose.status)}
                      </Tag>
                    </div>
                  </div>
                </div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Giá gói">
              {appointment.price?.toLocaleString("vi-VN")} VNĐ
            </Descriptions.Item>
          </>
        ) : (
          <>
            <Descriptions.Item label="Tên vaccine">
              {appointment.vaccine?.vaccineName}
            </Descriptions.Item>
            <Descriptions.Item label="Thuộc lô">
              {batchData[appointment.batchId]?.batchNumber || "Không có"}
            </Descriptions.Item>


            <Descriptions.Item label="Giá mũi:">
              {appointment.price?.toLocaleString("vi-VN")} VNĐ
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Ngày tiêm">
          {appointment.date}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo đơn">
          {appointment.createdAt || "Chưa có thông tin"}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          {appointment.note || "Chưa có thông tin"}
        </Descriptions.Item>
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
      title: "Ngày tạo đơn",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      sorter: (a, b) => {
        const [dayA, monthA, yearA] = a.createdAt.split('/');
        const [dayB, monthB, yearB] = b.createdAt.split('/');

        const [hourA, minuteA] = a.time.split(':');
        const [hourB, minuteB] = b.time.split(':');

        const dateA = new Date(yearA, monthA - 1, dayA, hourA || 0, minuteA || 0);
        const dateB = new Date(yearB, monthB - 1, dayB, hourB || 0, minuteB || 0);

        return dateA - dateB; // Đảo ngược thứ tự so sánh
      },
      defaultSortOrder: 'ascend', // Thay đổi thành ascend
      sortDirections: ['ascend', 'descend'],
      render: (text) => text
    },
    {
      title: "Người tiêm",
      key: "name",
      width: "20%",
      render: (_, record) => {
        const name =
          !record.child || record.child === null
            ? record.customer?.customerName
            : record.child?.name;
        return (
          <div>
            <div>{name}</div>
            {record.child && (
              <small style={{ color: "#666" }}>
                {getParentRelation(record.customer?.gender)}:{" "}
                {record.customer?.customerName}
              </small>
            )}
          </div>
        );
      },
      sorter: (a, b) => {
        const nameA = !a.child ? a.customer?.customerName : a.child?.name;
        const nameB = !b.child ? b.customer?.customerName : b.child?.name;
        return nameA?.localeCompare(nameB);
      },
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) => {
        const name = !record.child
          ? record.customer?.customerName
          : record.child?.name;
        return name?.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Ngày tiêm",
      dataIndex: "date",
      key: "date",
      width: "15%",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      sortOrder: sortedInfo.columnKey === "date" && sortedInfo.order,
    },
    {
      title: "Loại tiêm",
      key: "type",
      width: "15%",
      render: (_, record) => (
        <Tag color={record.type === "Tiêm gói" ? "#87d068" : "#108ee9"}>
          {record.type}
        </Tag>
      ),
      filters: [
        { text: "Tiêm gói", value: "Tiêm gói" },
        { text: "Tiêm lẻ", value: "Tiêm lẻ" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: "15%",
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)} className="status-tag">
          {getStatusText(record.status)}
        </Tag>
      ),
      ...(activeTab !== "pending" && {
        filters: [
          { text: "Đã tiêm", value: "completed" },
          { text: "Đã hủy", value: "incomplete" },
          { text: "Chưa thanh toán", value: "pending" },
          { text: "Chờ tiêm", value: "paid" },
        ],
        onFilter: (value, record) => record.status?.toLowerCase() === value,
      }),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "10%",
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
