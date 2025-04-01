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
  Space,
} from "antd";
import {
  SearchOutlined,
  CheckCircleFilled,
  MenuOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axiosInstance from "../../../service/api";
import "./appointmentManagement.css";
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AppointmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [appointmentsGoi, setAppointmentsGoi] = useState([]);
  const [appointmentsLe, setAppointmentsLe] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [, setActiveTab] = useState("1");
  const [detailLoading, setDetailLoading] = useState(false);
  const [filteredAppointmentsGoi, setFilteredAppointmentsGoi] = useState([]);
  const [filteredAppointmentsLe, setFilteredAppointmentsLe] = useState([]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accesstoken");

      const populateCustomerData = async (appointments) => {
        if (!appointments || appointments.length === 0) return appointments;

        // Identify which customer IDs need to be fetched
        const customerIdsToFetch = new Set();
        appointments.forEach((apt) => {
          if (
            typeof apt.cusId === "string" &&
            !apt.customer &&
            !apt.customerDetails
          ) {
            customerIdsToFetch.add(apt.cusId);
          }
        });

        if (customerIdsToFetch.size === 0) return appointments;

        try {
          console.log(
            `Fetching details for ${customerIdsToFetch.size} customers...`
          );
          const customerMap = {};

          for (const customerId of customerIdsToFetch) {
            try {
              const customerResponse = await axiosInstance.get(
                `/customer/getCustomerById/${customerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (customerResponse.data) {
                customerMap[customerId] = customerResponse.data;
              }
            } catch (error) {
              console.error(`Error fetching customer ${customerId}:`, error);
            }
          }

          // Update appointment data with customer details
          return appointments.map((apt) => {
            if (typeof apt.cusId === "string" && customerMap[apt.cusId]) {
              return {
                ...apt,
                customerDetails: customerMap[apt.cusId],
              };
            }
            return apt;
          });
        } catch (error) {
          console.error("Error populating customer data:", error);
          return appointments;
        }
      };

      // Helper function to populate vaccine details for appointment data
      const populateVaccineData = async (appointments) => {
        // Skip if no appointments
        if (!appointments || appointments.length === 0) return appointments;

        // Identify which vaccine IDs need to be fetched
        const vaccineIdsToFetch = new Set();
        appointments.forEach((apt) => {
          if (
            apt.vaccineId &&
            typeof apt.vaccineId === "string" &&
            !apt.vaccine &&
            !apt.vaccineDetails
          ) {
            vaccineIdsToFetch.add(apt.vaccineId);
          }
        });

        // If no vaccine IDs need fetching, return as is
        if (vaccineIdsToFetch.size === 0) return appointments;

        try {
          console.log(
            `Fetching details for ${vaccineIdsToFetch.size} vaccines...`
          );
          const vaccineMap = {};

          // Fetch vaccine details
          for (const vaccineId of vaccineIdsToFetch) {
            try {
              // Thử nhiều endpoint khác nhau để tìm thông tin vaccine
              let foundVaccine = false;

              // Thử endpoint 1: /vaccines/detail
              try {
                const vaccineResponse = await axiosInstance.get(
                  `/vaccines/detail/${vaccineId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (vaccineResponse.data) {
                  vaccineMap[vaccineId] = vaccineResponse.data;
                  foundVaccine = true;
                  console.log(`Found vaccine ${vaccineId} at /vaccines/detail`);
                }
              } catch (err1) {
                console.log(
                  `No vaccine at /vaccines/detail/${vaccineId}`,
                  err1
                );
              }

              // Thử endpoint 2: /vaccinceInventorys
              if (!foundVaccine) {
                try {
                  const vaccineResponse = await axiosInstance.get(
                    `/vaccine/inventory/${vaccineId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  if (vaccineResponse.data) {
                    vaccineMap[vaccineId] = vaccineResponse.data;
                    foundVaccine = true;
                    console.log(
                      `Found vaccine ${vaccineId} at /vaccine/inventory`
                    );
                  }
                } catch (err2) {
                  console.log(
                    `No vaccine at /vaccine/inventory/${vaccineId}`,
                    err2
                  );
                }
              }

              // Thử endpoint 3: vaccine by id direct
              if (!foundVaccine) {
                try {
                  const vaccineResponse = await axiosInstance.get(
                    `/vaccine/${vaccineId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  if (vaccineResponse.data) {
                    vaccineMap[vaccineId] = vaccineResponse.data;
                    foundVaccine = true;
                    console.log(
                      `Found vaccine ${vaccineId} at direct /vaccine endpoint`
                    );
                  }
                } catch (err3) {
                  console.log(
                    `No vaccine at direct /vaccine/${vaccineId}`,
                    err3
                  );
                }
              }

              // Nếu không tìm thấy, ghi log
              if (!foundVaccine) {
                console.error(
                  `Could not find vaccine with ID ${vaccineId} at any endpoint`
                );
              }
            } catch (error) {
              console.error(
                `Error in vaccine fetch loop for ${vaccineId}:`,
                error
              );
            }
          }

          // Update appointment data with vaccine details
          return appointments.map((apt) => {
            // Nếu đã có thông tin về vaccine, không cần cập nhật
            if (apt.vaccine && apt.vaccine.vaccineName) {
              return apt;
            }

            if (
              apt.vaccineId &&
              typeof apt.vaccineId === "string" &&
              vaccineMap[apt.vaccineId]
            ) {
              return {
                ...apt,
                vaccineDetails: vaccineMap[apt.vaccineId],
              };
            }

            // Trích xuất tên vaccine từ note nếu có
            if (!apt.vaccineDetails && apt.note) {
              let extractedName = null;

              if (apt.note.includes("vaccine")) {
                const match = apt.note.match(/vaccine\s+(.+?)(\s+|$)/i);
                if (match && match[1]) {
                  extractedName = match[1];
                }
              } else if (apt.note.includes("tiêm")) {
                const match = apt.note.match(/tiêm\s+(.+?)(\s+|$)/i);
                if (match && match[1]) {
                  extractedName = match[1];
                }
              }

              if (extractedName) {
                return {
                  ...apt,
                  vaccineDetails: { vaccineName: extractedName },
                };
              }
            }

            return apt;
          });
        } catch (error) {
          console.error("Error populating vaccine data:", error);
          return appointments;
        }
      };

      // Helper function to populate vaccine package details
      const populatePackageData = async (appointments) => {
        // Skip if no appointments
        if (!appointments || appointments.length === 0) return appointments;

        try {
          // Cập nhật dữ liệu gói vaccine dựa trên note
          return appointments.map((apt) => {
            // Nếu đã có thông tin về gói, không cần cập nhật
            if (apt.vaccinePakage && apt.vaccinePakage.packageName) {
              return apt;
            }

            // Trích xuất tên gói từ note nếu có
            if (apt.note) {
              let extractedName = null;

              if (apt.note.includes("gói")) {
                const match = apt.note.match(/gói\s+(.+?)(\s+|$)/i);
                if (match && match[1]) {
                  extractedName = match[1];
                }
              }

              if (extractedName) {
                return {
                  ...apt,
                  packageDetails: { packageName: extractedName },
                };
              }
            }

            return apt;
          });
        } catch (error) {
          console.error("Error populating package data:", error);
          return appointments;
        }
      };

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

      // Debug log để xem cấu trúc dữ liệu của lịch hẹn lẻ
      if (responseLe.data && responseLe.data.length > 0) {
        const sampleLe = responseLe.data[0];
        console.log("Cấu trúc dữ liệu lịch hẹn lẻ:", {
          id: sampleLe._id,
          cusId: sampleLe.cusId,
          cusIdType: typeof sampleLe.cusId,
          hasCustomer: !!sampleLe.customer,
          hasCustomerDetails: !!sampleLe.customerDetails,
          fullData: sampleLe,
        });
      }

      // Debug log để xem cấu trúc dữ liệu của lịch hẹn gói
      if (responseGoi.data && responseGoi.data.length > 0) {
        const sampleGoi = responseGoi.data[0];
        console.log("Cấu trúc dữ liệu lịch hẹn gói:", {
          id: sampleGoi._id,
          cusId: sampleGoi.cusId,
          cusIdType: typeof sampleGoi.cusId,
          hasCustomer: !!sampleGoi.customer,
          hasCustomerDetails: !!sampleGoi.customerDetails,
          fullData: sampleGoi,
        });
      }

      // Không cần fetch thêm thông tin nếu API đã trả về đầy đủ
      const goiData = responseGoi.data || [];

      // Populate customer data for le appointments
      let leData = await populateCustomerData(responseLe.data || []);
      // Additionally populate vaccine data
      leData = await populateVaccineData(leData);

      setAppointmentsLe(leData);
      setAppointmentsGoi(goiData);
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
        return "darkred";
      case "Paid":
        return "blue";
      case "approve":
        return "darkblue";
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
        return "Hủy thanh toán";
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
        message.success(
          `${
            completed ? "Đánh dấu đã tiêm" : "Hủy đánh dấu"
          } mũi ${doseNumber} thành công`
        );

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
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend",
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price) =>
        price ? price.toLocaleString("vi-VN") + " VNĐ" : "N/A",
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
            <Tag color={color} className="progress-tag">
              {completedDoses}/{totalDoses} mũi
            </Tag>
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
        { text: "Đã hủy", value: "incomplete" },
        { text: "Đã thanh toán", value: "Paid" },
        { text: "Đã duyệt", value: "approve" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      defaultSortOrder: "ascend", // Sắp xếp mặc định theo thứ tự tăng dần
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="action-buttons">
          {record.status === "Paid" && (
            <>
              <Button
                type="primary"
                className="complete-button"
                onClick={() => handleStatusChange(record._id, "approve", true)}
              >
                Duyệt đơn
              </Button>
              <Button
                danger
                className="cancel-button"
                onClick={() => handleStatusChange(record._id, "incomplete", true)}
              >
                Hủy đơn
              </Button>
            </>
          )}
          {record.status === "Pending" && (
            <Button
              danger
              className="cancel-button"
              onClick={() => handleStatusChange(record._id, "incomplete", true)}
            >
              Hủy đơn
            </Button>
          )}
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => showAppointmentDetails(record)}
            disabled={record.status === "incomplete"}
            className="detail-button"
          />
        </div>
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
        // Debug thông tin
        if (
          typeof cusId === "string" &&
          !record.customer &&
          !record.customerDetails
        ) {
          console.log(`Appointment ${record._id} cusId:`, cusId);
        }

        // Kiểm tra nếu cusId là ObjectId
        let customerString = "";
        if (cusId) {
          // Nếu cusId là object và có customerName
          if (cusId.customerName) {
            customerString = cusId.customerName;
          }
          // Nếu customer object tồn tại
          else if (record.customer && record.customer.customerName) {
            customerString = record.customer.customerName;
          }
          // Nếu customerDetails tồn tại
          else if (
            record.customerDetails &&
            record.customerDetails.customerName
          ) {
            customerString = record.customerDetails.customerName;
          }
          // Nếu là string, kiểm tra xem có phải là ObjectId không
          else if (typeof cusId === "string") {
            // Hiển thị ID rút gọn
            customerString = "ID: " + cusId.substring(0, 8) + "...";
          }
          // Mặc định
          else {
            customerString = "Không xác định";
          }
        } else {
          customerString = "N/A";
        }

        return (
          <span title={typeof cusId === "string" ? cusId : ""}>
            {customerString}
          </span>
        );
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
      width: 110,
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend",
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price) =>
        price ? price.toLocaleString("vi-VN") + " VNĐ" : "N/A",
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đã hủy", value: "incomplete" },
        { text: "Đã thanh toán", value: "Paid" },
        { text: "Đã duyệt", value: "approve" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      defaultSortOrder: "ascend",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="action-buttons">
          {record.status === "Paid" && (
            <>
              <Button
                type="primary"
                className="complete-button"
                onClick={() =>
                  handleStatusChange(
                    record._id,
                    "completed",
                    false
                  )
                }
              >
                Hoàn thành
              </Button>
              <Button
                danger
                className="cancel-button"
                onClick={() =>
                  handleStatusChange(
                    record._id,
                    "incomplete",
                    false
                  )
                }
              >
                Hủy đơn
              </Button>
            </>
          )}
          {record.status === "approve" && (
            <Button
              type="primary"
              className="complete-button"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record._id, "completed", false)}
            >
              Complete
            </Button>
          )}
          {record.status === "Pending" && (
            <Button
              danger
              className="cancel-button"
              onClick={() =>
                handleStatusChange(
                  record._id,
                  "incomplete",
                  false
                )
              }
            >
              Hủy đơn
            </Button>
          )}
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => showAppointmentDetails(record, false)}
            disabled={record.status === "incomplete"}
            className="detail-button"
          />
        </div>
      ),
    },
  ];

  // Add useEffect hook for real-time filtering
  useEffect(() => {
    if (!searchText || searchText.trim() === "") {
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
        title={
          selectedAppointment?.isPackage
            ? "Chi tiết lịch hẹn gói"
            : "Chi tiết lịch hẹn lẻ"
        }
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
                  {selectedAppointment?.childId?.name || "Không có"}
                </span>
              </div>
              
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
                <span className="detail-value">
                  {selectedAppointment.time || "Chưa xác định"}
                </span>
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
                  {selectedAppointment.createdAt || "N/A"}
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

              {/* Phần thao tác cho lịch hẹn lẻ */}
              {!selectedAppointment.isPackage &&
                selectedAppointment.status !== "completed" && (
                <div className="detail-row" style={{ marginTop: "20px" }}>
                  <span className="detail-label">Thao tác:</span>
                  <span className="detail-value">
                    <div className="action-buttons">
                      {selectedAppointment.status === "Paid" && (
                        <>
                          <Button
                            type="primary"
                            className="approve-button"
                              onClick={() =>
                                handleStatusChange(
                                  selectedAppointment._id,
                                  "completed",
                                  false
                                )
                              }
                          >
                            Duyệt đơn
                          </Button>
                          <Button
                            danger
                            className="cancel-button"
                              onClick={() =>
                                handleStatusChange(
                                  selectedAppointment._id,
                                  "incomplete",
                                  false
                                )
                              }
                          >
                            Hủy đơn
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === "approve" && (
                        <Button
                          type="primary"
                          className="complete-button"
                            onClick={() =>
                              handleStatusChange(
                                selectedAppointment._id,
                                "completed",
                                false
                              )
                            }
                        >
                          Hoàn thành
                        </Button>
                      )}
                    </div>
                  </span>
                </div>
              )}

              {/* Phần thao tác cho lịch hẹn gói */}
              {selectedAppointment.isPackage &&
                (selectedAppointment.status === "Paid") && (
                  <div className="detail-row" style={{ marginTop: "20px" }}>
                    <span className="detail-label">Thao tác:</span>
                    <span className="detail-value">
                      <div className="action-buttons">
                        <Button
                          type="primary"
                          className="approve-button"
                          onClick={() =>
                            handleStatusChange(
                              selectedAppointment._id,
                              "approve",
                              true
                            )
                          }
                        >
                          Duyệt đơn
                        </Button>
                        <Button
                          danger
                          className="cancel-button"
                          onClick={() =>
                            handleStatusChange(
                              selectedAppointment._id,
                              "incomplete",
                              true
                            )
                          }
                        >
                          Hủy đơn
                        </Button>
                      </div>
                    </span>
                  </div>
                )}
            </div>

            {/* Hiển thị lịch tiêm cho từng mũi - chỉ cho lịch hẹn gói */}
            {selectedAppointment.isPackage &&
              selectedAppointment.doseSchedule &&
              selectedAppointment.doseSchedule.length > 0 &&
              (selectedAppointment.status === "approve" ||
                selectedAppointment.status === "completed") && (
                <div className="dose-schedule-section">
                  <div className="dose-header">
                    <Title level={4}>Lịch tiêm các mũi</Title>
                    <div className="dose-progress-summary">
                      {(() => {
                        const totalDoses =
                          selectedAppointment.doseSchedule.length;
                        const completedDoses =
                          selectedAppointment.doseSchedule.filter(
                            (dose) => dose.status === "completed"
                        ).length;
                        const progressPercent = Math.round(
                          (completedDoses / totalDoses) * 100
                        );
                        
                        let color = "#bfbfbf";
                        if (progressPercent === 100) color = "#52c41a";
                        else if (progressPercent > 50) color = "#1890ff";
                        else if (progressPercent > 0) color = "#faad14";
                        
                        return (
                          <>
                            <Tag color={color} className="summary-tag">
                              {completedDoses}/{totalDoses}
                            </Tag>
                            <span
                              className={`progress-percent progress-percent-${
                                progressPercent === 100
                                  ? "complete"
                                  : progressPercent > 50
                                  ? "half"
                                  : "start"
                              }`}
                            >
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
                                ? item.date.toLocaleDateString("vi-VN")
                                : item.date?.toString()}
                          </div>
                            </div>
                          <Divider className="dose-divider" />
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
                                    ? "Paid"
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

            {/* Hiển thị thông báo yêu cầu duyệt đơn khi đơn chưa được duyệt */}
            {selectedAppointment.isPackage &&
              (selectedAppointment.status === "Paid") && (
                <div className="dose-schedule-section">
                  <div className="approve-notice">
                    <Title level={4}>Thông báo</Title>
                    <div className="approve-notice-content">
                      <p>
                        Vui lòng duyệt đơn hàng trước khi xem lịch tiêm các mũi.
                      </p>
                      <p>
                        Sau khi duyệt, bạn sẽ thấy chi tiết lịch tiêm các mũi ở
                        đây.
                      </p>
                    </div>
                  </div>
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
