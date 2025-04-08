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
  Progress,
  Popconfirm
} from "antd";
import {
  SearchOutlined,
  CheckCircleFilled,
  MenuOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  CheckOutlined,
  UserOutlined,
  InfoCircleOutlined,
  EditOutlined
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

  const [selectedChildInfo, setSelectedChildInfo] = useState(null);
  const [isChildModalVisible, setIsChildModalVisible] = useState(false);

  const [healthNote, setHealthNote] = useState("");

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

      // Fetch children for each customer
      const childrenPromises = customersData.map(async (customer) => {
        try {
          const childrenResponse = await axiosInstance.get(
            `/child/getAllChildbyCusId/${customer._id}`,
            { headers: { Authorization: `Bearer ${accesstoken}` } }
          );
          return { customerId: customer._id, children: childrenResponse.data };
        } catch (error) {
          console.error(`Error fetching children for customer ${customer._id}:`, error);
          return { customerId: customer._id, children: [] };
        }
      });

      const childrenData = await Promise.all(childrenPromises);
      const childrenMap = childrenData.reduce((acc, item) => {
        acc[item.customerId] = item.children;
        return acc;
      }, {});

      // Fetch appointments
      const [leResponse, goiResponse] = await Promise.all([
        axiosInstance.get("/appointmentLe/showInfo"),
        axiosInstance.get("/appointmentGoi/showInfo")
      ]);

      // Enrich appointments with customer username, vaccine names, and child info
      const enrichedLe = leResponse.data.map(apt => {
        const customer = customersData.find(c => c._id === apt.cusId);
        const customerChildren = childrenMap[apt.cusId] || [];

        return {
          ...apt,
          type: "Lẻ",
          customerName: customer?.username || "Không xác định",
          customerFullName: customer?.customerName || "Không xác định",
          customerGender: customer?.gender || "Không xác định",
          vaccineName: vaccinesResponse.data.find(v => v._id === apt.vaccineId)?.vaccineName || "Không xác định",
          createdAt: apt.createdAt || "Không xác định",
          // Tìm thông tin trẻ nếu là đăng ký cho trẻ
          childInfo: customerChildren.find(child => child._id === apt.childId) || null
        };
      });

      const enrichedGoi = goiResponse.data.map(apt => {
        const customer = customersData.find(c => c._id === apt.cusId);
        const customerChildren = childrenMap[apt.cusId] || [];

        return {
          ...apt,
          type: "Gói",
          customerName: customer?.username || "Không xác định",
          customerFullName: customer?.customerName || "Không xác định",
          customerGender: customer?.gender || "Không xác định",
          vaccineName: packagesResponse.data.find(p => p._id === apt.vaccinePackageId)?.packageName || "Không xác định",
          createdAt: apt.createdAt || "Không xác định",
          // Tìm thông tin trẻ nếu là đăng ký cho trẻ
          childInfo: customerChildren.find(child => child._id === apt.childId) || null
        };
      });

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
      "pending": "yellow",
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
      "pending": "Chưa tiêm",
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
        setCheckoutNote(record.note || "");
        setIsRescheduleModalVisible(true);
        return;
      }

      await axiosInstance.post(updateEndpoint + record._id, {
        status: newStatus,
        note: record.note || ""
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
      
      if (record.type === 'Gói') {
        // Tìm mũi tiêm đầu tiên chưa hoàn thành
        const currentDose = record.doseSchedule.find(dose => dose.status !== 'completed');
        if (currentDose) {
          // Cập nhật trạng thái mũi tiêm hiện tại
          await axiosInstance.post(updateEndpoint + record._id, {
            status: "đang chờ",
            doseSchedule: record.doseSchedule.map(dose => 
              dose.doseNumber === currentDose.doseNumber 
                ? { ...dose, status: 'đang chờ' }
                : dose
            )
          });
        }
      } else {
        // Xử lý cho đơn lẻ như cũ
        await axiosInstance.post(updateEndpoint + record._id, {
          status: "đang chờ"
        });
      }
      
      message.success("Bắt đầu tiêm");
      fetchAllData();
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
      
      const updateData = {
        status: "Paid",
        note: checkoutNote || "Khám sàng lọc bất thường, cần đánh giá lại",
        date: rescheduleDate.format("DD/MM/YYYY")
      };

      if (selectedAppointment.type === 'Gói') {
        updateData.healthNote = healthNote || "";
      }

      await axiosInstance.post(updateEndpoint + selectedAppointment._id, updateData);

      message.success("Đã cập nhật lịch hẹn và ghi chú");
      setIsRescheduleModalVisible(false);
      setSelectedAppointment(null);
      setRescheduleDate(null);
      setCheckoutNote("");
      setHealthNote("");
      fetchAllData();
    } catch (error) {
      message.error("Không thể cập nhật lịch hẹn");
    }
  };

  const showAppointmentDetails = (record) => {
    setSelectedAppointmentDetail(record);
    setIsDetailModalVisible(true);
  };

  // Thêm hàm xử lý cập nhật note
  const handleUpdateNote = async (record) => {
    try {
      const updateEndpoint = record.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      const updateData = {
        note: checkoutNote || "Cập nhật ghi chú",
      };

      if (record.type === 'Gói') {
        updateData.healthNote = healthNote || "";
      }

      await axiosInstance.post(updateEndpoint + record._id, updateData);
      message.success("Cập nhật ghi chú thành công");
      setIsCheckoutModalVisible(false);
      setCurrentCheckoutRecord(null);
      setCheckoutNote("");
      setHealthNote("");
      fetchAllData();
    } catch (error) {
      message.error("Không thể cập nhật ghi chú");
    }
  };

  // Cập nhật hàm renderActionButtons
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
        <div>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => {
              setCurrentCheckoutRecord(record);
              setCheckoutNote(record.note || "");
              setIsCheckoutModalVisible(true);
            }}
            style={{ marginRight: 8 }}
          >
            Cập nhật
          </Button>
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={() => handleCheckout(record)}
          >
            Checkout
          </Button>
        </div>
      ),
      "5": null  // Tab Check-Out - không có nút hành động
    };

    return actionMap[activeTab] || null;
  };

  // Cập nhật hàm handleCheckout
  const handleCheckout = async (record) => {
    try {
      const updateEndpoint = record.vaccinePackageId 
        ? "/appointmentGoi/update/" 
        : "/appointmentLe/update/";
      
      if (record.type === 'Gói') {
        const currentDose = record.doseSchedule.find(dose => dose.status === 'đang chờ');
        if (currentDose) {
          const completedDoses = record.doseSchedule.filter(dose => dose.status === 'completed').length;
          const totalDoses = record.doseSchedule.length;
          
          if (completedDoses + 1 === totalDoses) {
            await axiosInstance.post(updateEndpoint + record._id, {
              status: "completed",
              note: record.note || "Hoàn thành tiêm, sức khỏe ổn định",
              doseSchedule: record.doseSchedule.map(dose => 
                dose.doseNumber === currentDose.doseNumber 
                  ? { ...dose, status: 'completed' }
                  : dose
              )
            });
          } else {
            const nextDose = record.doseSchedule.find(dose => 
              dose.doseNumber > currentDose.doseNumber && dose.status !== 'completed'
            );
            
            await axiosInstance.post(updateEndpoint + record._id, {
              status: "Paid",
              note: record.note || "Hoàn thành mũi tiêm, sức khỏe ổn định",
              date: nextDose?.date || record.date,
              doseSchedule: record.doseSchedule.map(dose => 
                dose.doseNumber === currentDose.doseNumber 
                  ? { ...dose, status: 'completed' }
                  : dose
              )
            });
          }
        }
      } else {
        await axiosInstance.post(updateEndpoint + record._id, {
          status: "completed",
          note: record.note || "Hoàn thành tiêm, sức khỏe ổn định"
        });
      }

      message.success("Check-out thành công");
      fetchAllData();
    } catch (error) {
      message.error("Không thể check-out");
    }
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
        setCheckoutNote("");
      }}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <div>
        <p>Vui lòng chọn ngày hẹn mới do kết quả khám sàng lọc bất thường:</p>
        <DatePicker 
          style={{ width: '100%', marginBottom: 16 }} 
          onChange={(date) => setRescheduleDate(date)}
          disabledDate={(current) => current && current < moment().startOf('day')}
        />
        
        <div style={{ marginBottom: 16 }}>
          <p>Ghi chú trong quá trình tiêm:</p>
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập ghi chú về kết quả khám sàng lọc (nếu có)"
            value={checkoutNote}
            onChange={(e) => setCheckoutNote(e.target.value)}
          />
        </div>
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
              <div className="child-info-section">
                <h3>Thông tin trẻ em</h3>
                <div className="child-card">
                  <div className="child-avatar-circle">
                    <UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                  </div>
                  <div className="child-info">
                    <div className="child-name">
                      <strong>Tên trẻ: </strong>
                      {selectedAppointmentDetail.childInfo.name}
                    </div>
                    <div className="child-birthday">
                      <strong>Ngày sinh: </strong>
                      {selectedAppointmentDetail.childInfo.birthday}
                    </div>
                    <div className="child-gender">
                      <strong>Giới tính: </strong>
                      {selectedAppointmentDetail.childInfo.gender === 'Male' ? 'Nam' : 'Nữ'}
                    </div>
                    <div className="child-health-note">
                      <strong>Ghi chú sức khỏe: </strong>
                      {selectedAppointmentDetail.childInfo.healthNote || "Không có"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedAppointmentDetail.type === "Gói" && selectedAppointmentDetail.doseSchedule && (
            <>
              <Divider />
              <div className="dose-schedule-section">
                <h3>Lịch tiêm theo gói</h3>
                {selectedAppointmentDetail.doseSchedule.map((dose, index) => (
                  <div key={index} className="dose-schedule-item">
                    <h4>Mũi {dose.doseNumber}</h4>
                    <div className="dose-info">
                      <div>• Tên vaccine: {
                        vaccineList.find(v => v._id === dose.vaccineId)?.vaccineName || 
                        "Chưa có thông tin"
                      }</div>
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
              </div>
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

  // Cập nhật modal checkout
  const renderCheckoutModal = () => (
    <Modal
      title="Cập nhật ghi chú"
      open={isCheckoutModalVisible}
      onOk={() => handleUpdateNote(currentCheckoutRecord)}
      onCancel={() => {
        setIsCheckoutModalVisible(false);
        setCurrentCheckoutRecord(null);
        setCheckoutNote("");
      }}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <div>
        <div style={{ marginBottom: 16 }}>
          <p>Ghi chú trong quá trình tiêm:</p>
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập ghi chú sau khi theo dõi (nếu có)"
            value={checkoutNote}
            onChange={(e) => setCheckoutNote(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 16, color: '#666' }}>
          <p>Vui lòng ghi chú tình trạng sức khỏe sau khi tiêm và theo dõi</p>
        </div>
      </div>
    </Modal>
  );

  // Modal hiển thị thông tin chi tiết của trẻ
  const renderChildDetailsModal = () => (
    <Modal
      title="Thông tin chi tiết trẻ em"
      open={isChildModalVisible}
      onCancel={() => {
        setIsChildModalVisible(false);
        setSelectedChildInfo(null);
      }}
      footer={[
        <Button key="close" onClick={() => setIsChildModalVisible(false)}>
          Đóng
        </Button>
      ]}
      width={500}
    >
      {selectedChildInfo && (
        <div className="child-details-modal">
          <div className="child-avatar-circle">
            <UserOutlined style={{ fontSize: 48, color: "#1890ff" }} />
          </div>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên trẻ">
              {selectedChildInfo.name}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedChildInfo.birthday}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedChildInfo.gender === 'Male' ? 'Nam' : 'Nữ'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú sức khỏe">
              {selectedChildInfo.healthNote || 'Không có ghi chú'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );

  // Cập nhật columns để thêm cột Trẻ em
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
      title: 'Người tiêm',
      key: 'name',
      width: '20%',
      render: (_, record) => {
        const name = !record.childInfo || record.childInfo === null
          ? record.customerFullName
          : record.childInfo.name;
        return (
          <div>
            <div>{name}</div>
            {record.childInfo && (
              <small style={{ color: "#666" }}>
                {record.customerGender?.toLowerCase() === 'male' ? 'Cha' : 'Mẹ'}: {record.customerFullName}
              </small>
            )}
          </div>
        );
      },
      sorter: (a, b) => {
        const nameA = !a.childInfo ? a.customerFullName : a.childInfo.name;
        const nameB = !b.childInfo ? b.customerFullName : b.childInfo.name;
        return nameA?.localeCompare(nameB);
      },
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) => {
        const name = !record.childInfo
          ? record.customerFullName
          : record.childInfo.name;
        return name?.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName'
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_, record) => {
        if (record.type === 'Gói' && record.doseSchedule) {
          const completedDoses = record.doseSchedule.filter(dose => dose.status === 'completed').length;
          const totalDoses = record.doseSchedule.length;
          return `${completedDoses}/${totalDoses}`;
        }
        return '-';
      }
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
          +
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
      {renderChildDetailsModal()}
    </div>
  );
};

export default AppointmentManagement;
