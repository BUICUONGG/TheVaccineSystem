import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Spin,
  Alert,
  Button,
  Tag,
  Progress,
  Tooltip,
  Modal,
} from "antd";
import {
  UserOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  CommentOutlined,
  CalendarOutlined,
  StarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import axiosInstance from "../../../service/api";
import { useNavigate } from "react-router-dom";
import "./dashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRoleModalVisible, setUserRoleModalVisible] = useState(false);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [stats, setStats] = useState({
    userList: [],
    totalVaccines: 0,
    totalBlogs: 0,
    totalNews: 0,
    totalCustomers: 0,
    totalAppointments: 0,
    totalFeedback: 0,
    recentAppointments: [],
    recentVaccines: [],
    appointmentStats: {
      pending: 0,
      approved: 0,
      completed: 0,
      incomplete: 0,
    },
    feedbackStats: {
      averageRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStars: 0,
    },
    monthlyAppointments: [],
    revenueStats: {
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
      monthlyRevenue: []
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const accesstoken = localStorage.getItem("accesstoken");

      if (!accesstoken) {
        setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      console.log(
        "Starting dashboard data fetch with token:",
        accesstoken.substring(0, 10) + "..."
      );

      // Fetch all data in parallel with better error handling
      try {
        const [
          usersResponse,
          vaccinesResponse,
          blogsResponse,
          newsResponse,
          appointmentsLeResponse,
          appointmentsGoiResponse,
          feedbackResponse,
        ] = await Promise.all([
          axiosInstance
            .get("/user/showInfo", {
              headers: { Authorization: `Bearer ${accesstoken}` },
            })
            .catch((err) => {
              console.error(
                "Error fetching users:",
                err.response?.data || err.message
              );
              return { data: [] };
            }),
          axiosInstance
            .get("/vaccine/showInfo", {
              headers: { Authorization: `Bearer ${accesstoken}` },
            })
            .catch((err) => {
              console.error(
                "Error fetching vaccines:",
                err.response?.data || err.message
              );
              return { data: [] };
            }),
          axiosInstance
            .get("/blog/showBlog", {
              headers: { Authorization: `Bearer ${accesstoken}` },
            })
            .catch((err) => {
              console.error(
                "Error fetching blogs:",
                err.response?.data || err.message
              );
              return { data: [] };
            }),
          axiosInstance
            .get("/news/getAllNews", {
              headers: { Authorization: `Bearer ${accesstoken}` },
            })
            .catch((err) => {
              console.error(
                "Error fetching news:",
                err.response?.data || err.message
              );
              return { data: { result: [] } };
            }),
          axiosInstance
            .get("/appointmentLe/getdetailallaptle", {
              headers: { Authorization: `Bearer ${accesstoken}` },
            })
            .catch((err) => {
              console.error(
                "Error fetching appointmentsLe:",
                err.response?.data || err.message
              );
              return { data: [] };
            }),
          axiosInstance
            .get("/appointmentGoi/showDetailAptGoi", {
              headers: { Authorization: `Bearer ${accesstoken}` },
            })
            .catch((err) => {
              console.error(
                "Error fetching appointmentsGoi:",
                err.response?.data || err.message
              );
              return { data: [] };
            }),
          axiosInstance
            .get("/feedback/getAllFeedback", {
              headers: { Authorization: `Bearer ${accesstoken}` },
            })
            .catch((err) => {
              console.error(
                "Error fetching feedback:",
                err.response?.data || err.message
              );
              return { data: [] };
            }),
        ]);

        console.log("All API calls completed");

        // Process user data
        let sortedUsers = [];
        if (usersResponse && usersResponse.data) {
          sortedUsers = Array.isArray(usersResponse.data)
            ? usersResponse.data
            : usersResponse.data.result || [];
          console.log(`Processed ${sortedUsers.length} users`);
        }

        const totalCustomers = sortedUsers.filter(
          (user) => user.role === "customer"
        ).length;

        // Process appointments
        let appointmentsLe = [];
        if (appointmentsLeResponse && appointmentsLeResponse.data) {
          appointmentsLe = Array.isArray(appointmentsLeResponse.data)
            ? appointmentsLeResponse.data
            : [];
          console.log(`Processed ${appointmentsLe.length} lẻ appointments`);
        }

        let appointmentsGoi = [];
        if (appointmentsGoiResponse && appointmentsGoiResponse.data) {
          appointmentsGoi = Array.isArray(appointmentsGoiResponse.data)
            ? appointmentsGoiResponse.data
            : [];
          console.log(`Processed ${appointmentsGoi.length} gói appointments`);
        }

        const allAppointments = [...appointmentsLe, ...appointmentsGoi];
        const totalAppointments = allAppointments.length;

        // Calculate appointment statistics
        const appointmentStats = {
          pending: allAppointments.filter((a) => a.status === "pending").length,
          approved: allAppointments.filter((a) => a.status === "approve")
            .length,
          completed: allAppointments.filter((a) => a.status === "completed")
            .length,
          incomplete: allAppointments.filter((a) => a.status === "incomplete")
            .length,
        };

        // Get recent appointments (combine and sort by date)
        const recentAppointments = allAppointments
          .sort((a, b) => {
            const dateA = new Date(a.date || a.createAt || 0);
            const dateB = new Date(b.date || b.createAt || 0);
            return dateB - dateA;
          })
          .slice(0, 5);

        // Get recent vaccines
        let recentVaccines = [];
        if (vaccinesResponse && vaccinesResponse.data) {
          recentVaccines = Array.isArray(vaccinesResponse.data)
            ? vaccinesResponse.data.slice(0, 5)
            : [];
          console.log(`Processed ${recentVaccines.length} recent vaccines`);
        }

        // Process feedback data
        let feedbacks = [];
        if (feedbackResponse && feedbackResponse.data) {
          feedbacks = Array.isArray(feedbackResponse.data)
            ? feedbackResponse.data
            : [];
          console.log(`Processed ${feedbacks.length} feedback entries`);
        }

        const totalFeedback = feedbacks.length;

        // Calculate feedback statistics
        const ratingSum = feedbacks.reduce(
          (sum, feedback) => sum + (feedback.rating || 0),
          0
        );
        const averageRating =
          totalFeedback > 0 ? (ratingSum / totalFeedback).toFixed(1) : 0;

        const feedbackStats = {
          averageRating,
          fiveStars: feedbacks.filter((f) => f.rating === 5).length,
          fourStars: feedbacks.filter((f) => f.rating === 4).length,
          threeStars: feedbacks.filter((f) => f.rating === 3).length,
          twoStars: feedbacks.filter((f) => f.rating === 2).length,
          oneStars: feedbacks.filter((f) => f.rating === 1).length,
        };

        // Calculate monthly appointment data
        const monthlyAppointments = calculateMonthlyData(allAppointments);

        // Calculate revenue statistics
        const revenueStats = calculateRevenueStats(allAppointments);

        // Process news data
        let newsCount = 0;
        if (newsResponse && newsResponse.data && newsResponse.data.result) {
          newsCount = newsResponse.data.result.length;
        }

        setStats({
          userList: sortedUsers,
          totalVaccines: Array.isArray(vaccinesResponse.data)
            ? vaccinesResponse.data.length
            : 0,
          totalBlogs: blogsResponse.data && blogsResponse.data.total
            ? blogsResponse.data.total
            : 0,
          totalNews: newsResponse.data && newsResponse.data.total
            ? newsResponse.data.total
            : (newsResponse.data && newsResponse.data.result ? newsResponse.data.result.length : 0),
          totalCustomers,
          totalAppointments,
          totalFeedback,
          recentAppointments,
          recentVaccines,
          appointmentStats,
          feedbackStats,
          monthlyAppointments,
          revenueStats,
        });

        console.log("Dashboard data successfully processed and set");
      } catch (apiError) {
        console.error("API Promise.all error:", apiError);
        setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly data for appointments
  const calculateMonthlyData = (appointments) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();

    // Initialize data structure
    const monthlyData = months.map((month) => ({
      month,
      completed: 0,
      pending: 0,
      total: 0,
    }));

    // Count appointments by month
    appointments.forEach((appointment) => {
      const date = new Date(appointment.date || appointment.createAt);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].total += 1;

        if (appointment.status === "completed") {
          monthlyData[monthIndex].completed += 1;
        } else if (
          appointment.status === "pending" ||
          appointment.status === "approve"
        ) {
          monthlyData[monthIndex].pending += 1;
        }
      }
    });

    return monthlyData;
  };

  // Calculate revenue statistics
  const calculateRevenueStats = (appointments) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly revenue data
    const monthlyRevenue = months.map(month => ({
      month,
      revenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0
    }));
    
    // Initialize total revenue counters
    let totalRevenue = 0;
    let completedRevenue = 0;
    let pendingRevenue = 0;
    
    // Process each appointment for revenue calculation
    appointments.forEach(appointment => {
      const price = appointment.price || 0;
      
      // Add to total revenue statistics
      totalRevenue += price;
      
      if (appointment.status === "completed") {
        completedRevenue += price;
      } else if (appointment.status === "pending" || appointment.status === "approve") {
        pendingRevenue += price;
      }
      
      // Add to monthly revenue data
      const date = new Date(appointment.date || appointment.createAt || appointment.createdAt);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyRevenue[monthIndex].revenue += price;
        
        if (appointment.status === "completed") {
          monthlyRevenue[monthIndex].completedRevenue += price;
        } else if (appointment.status === "pending" || appointment.status === "approve") {
          monthlyRevenue[monthIndex].pendingRevenue += price;
        }
      }
    });
    
    return {
      totalRevenue,
      completedRevenue,
      pendingRevenue,
      monthlyRevenue
    };
  };

  // Function to show user role modal
  const showUserRoleModal = () => {
    setUserRoleModalVisible(true);
  };

  // Close user role modal
  const closeUserRoleModal = () => {
    setUserRoleModalVisible(false);
  };

  // Function to show content modal
  const showContentModal = () => {
    setContentModalVisible(true);
  };

  // Function to close content modal
  const closeContentModal = () => {
    setContentModalVisible(false);
  };

  // Tính toán số lượng người dùng theo role
  const roleCount = stats.userList.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(roleCount).map(([type, value]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    value,
  }));

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name}: {percentage}",
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
    legend: {
      position: "bottom",
    },
  };

  // Transform data for column chart
  const columnData = [];
  if (stats.monthlyAppointments) {
    stats.monthlyAppointments.forEach((item) => {
      columnData.push(
        { month: item.month, value: item.completed, type: "Completed" },
        { month: item.month, value: item.pending, type: "Pending" }
      );
    });
  }

  const columnConfig = {
    data: columnData,
    isGroup: true,
    xField: "month",
    yField: "value",
    seriesField: "type",
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
    color: ["#52c41a", "#faad14"],
    label: {
      position: "middle",
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
        { type: "adjust-color" },
      ],
    },
  };

  // Recent appointments columns
  const appointmentColumns = [
    // {
    //   title: "Khách hàng",
    //   key: "customer",
    //   render: (_, record) => {
    //     const customerName =
    //       record.customer?.customerName ||
    //       record.customerDetails?.customerName ||
    //       record.cusId?.customerName ||
    //       record.cusId?.name ||
    //       "N/A";
    //     return customerName;
    //   },
    // },
    {
      title: "Loại",
      key: "type",
      render: (_, record) => (record.vaccineId ? "Gói" : "Lẻ"),
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
      render: (date) => date || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "Không xác định";

        switch (status) {
          case "completed":
            color = "green";
            text = "Hoàn thành";
            break;
          case "incomplete":
            color = "red";
            text = "Đã hủy";
            break;
          case "pending":
            color = "orange";
            text = "Đang chờ";
            break;
          case "approve":
            color = "blue";
            text = "Đã duyệt";
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // Recent vaccines columns
  const vaccineColumns = [
    {
      title: "Tên vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Nhà sản xuất",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
    {
      title: "Giá",
      key: "price",
      render: (_, record) => {
        if (
          record.vaccineImports &&
          record.vaccineImports.length > 0 &&
          record.vaccineImports[0].price
        ) {
          return `${record.vaccineImports[0].price.toLocaleString()} VNĐ`;
        }
        return "Chưa có giá";
      },
    },
  ];

  // Feedback rating distribution
  const feedbackRatingData = [
    { type: "5 sao", value: stats.feedbackStats.fiveStars },
    { type: "4 sao", value: stats.feedbackStats.fourStars },
    { type: "3 sao", value: stats.feedbackStats.threeStars },
    { type: "2 sao", value: stats.feedbackStats.twoStars },
    { type: "1 sao", value: stats.feedbackStats.oneStars },
  ];

  const feedbackPieConfig = {
    data: feedbackRatingData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name}: {percentage}",
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
    legend: {
      position: "bottom",
    },
    color: ["#52c41a", "#91d5ff", "#faad14", "#ff7a45", "#f5222d"],
  };

  // Function to navigate to accounts page
  const navigateToAccounts = () => {
    navigate("/admin/accounts");
  };

  // Transform data for revenue column chart
  const revenueColumnData = [];
  if (stats.revenueStats?.monthlyRevenue) {
    stats.revenueStats.monthlyRevenue.forEach(item => {
      revenueColumnData.push(
        { month: item.month, value: item.completedRevenue, type: "Đã thanh toán" },
      );
    });
  }

  const revenueColumnConfig = {
    data: revenueColumnData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
    color: ['#52c41a', '#faad14'],
    label: {
      position: 'middle',
      layout: [
        { type: 'interval-adjust-position' },
        { type: 'interval-hide-overlap' },
        { type: 'adjust-color' }
      ]
    },
    yAxis: {
      label: {
        formatter: (v) => `${(v / 1000000).toFixed(1)}M`
      }
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.type, value: datum.value.toLocaleString('vi-VN') + ' VNĐ' };
      }
    }
  };

  // Revenue table columns
  const revenueColumns = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Đã thanh toán',
      key: 'completedRevenue',
      render: (_, record) => `${record.completedRevenue.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a, b) => a.completedRevenue - b.completedRevenue,
    },
    {
      title: 'Tổng doanh thu',
      key: 'revenue',
      render: (_, record) => `${record.revenue.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchData}
            >
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Tổng quan hệ thống</h2>
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData}>
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={showUserRoleModal}
            className="stat-card clickable-card"
          >
            <Statistic
              title="Tổng người dùng"
              value={stats.userList.length}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={showContentModal}
            className="stat-card clickable-card"
          >
            <Statistic
              title="Nội dung"
              value={stats.totalBlogs + stats.totalNews}
              prefix={<FileTextOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Vaccine"
              value={stats.totalVaccines}
              prefix={<ExperimentOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Đánh giá"
              value={stats.totalFeedback}
              prefix={<CommentOutlined style={{ color: "#eb2f96" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Appointment Status Cards */}
      <Row gutter={[16, 16]} className="stats-row appointment-status-cards">
        <Col xs={24} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Lịch hẹn"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined style={{ color: "#13c2c2" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Đơn Tiêm thành công"
              value={stats.appointmentStats.completed}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
              suffix={<small>/{stats.totalAppointments}</small>}
            />
            <Progress
              percent={
                Math.round(
                  (stats.appointmentStats.completed / stats.totalAppointments) *
                    100
                ) || 0
              }
              strokeColor="#52c41a"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="stat-card">
            <Statistic
              title="Đơn bị hủy"
              value={stats.appointmentStats.incomplete}
              valueStyle={{ color: "#f5222d" }}
              prefix={<CloseCircleOutlined />}
              suffix={<small>/{stats.totalAppointments}</small>}
            />
            <Progress
              percent={
                Math.round(
                  (stats.appointmentStats.incomplete /
                    stats.totalAppointments) *
                    100
                ) || 0
              }
              strokeColor="#f5222d"
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} md={12}>
          <Card className="stat-card revenue-card">
            <Statistic
              title="Tổng doanh thu"
              value={stats.revenueStats.totalRevenue}
              valueStyle={{ color: "#1890ff" }}
              suffix="VNĐ"
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="stat-card completed-revenue-card">
            <Statistic
              title="Doanh thu sau tiêm"
              value={stats.revenueStats.completedRevenue}
              valueStyle={{ color: "#52c41a" }}
              suffix="VNĐ"
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} lg={12}>
          <Card title="Lịch hẹn theo tháng" className="dashboard-card">
            <div className="chart-container">
              <Column {...columnConfig} />
            </div>
          </Card>
        </Col>
      </Row> */}

      {/* Feedback and Appointments */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>Đánh giá khách hàng</span>
                <Tooltip title="Điểm đánh giá trung bình">
                  <Tag color="#722ed1" style={{ marginLeft: 8 }}>
                    <StarOutlined /> {stats.feedbackStats.averageRating}/5
                  </Tag>
                </Tooltip>
              </div>
            }
            className="dashboard-card"
          >
            <div className="chart-container">
              <Pie {...feedbackPieConfig} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Lịch hẹn gần đây" className="dashboard-card table-card">
            <Table
              dataSource={stats.recentAppointments}
              columns={appointmentColumns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Vaccines */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24}>
          <Card title="Vaccine mới nhất" className="dashboard-card table-card">
            <Table
              dataSource={stats.recentVaccines}
              columns={vaccineColumns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart & Table */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} lg={12}>
          <Card title="Doanh thu theo tháng" className="dashboard-card">
            <div className="chart-container">
              <Column {...revenueColumnConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Bảng doanh thu hàng tháng" className="dashboard-card table-card">
            <Table
              dataSource={stats.revenueStats.monthlyRevenue.filter(item => item.revenue > 0)}
              columns={revenueColumns}
              pagination={false}
              size="small"
              rowKey="month"
            />
          </Card>
        </Col>
      </Row>

      {/* Content Distribution Modal */}
      <Modal
        title="Chi tiết nội dung"
        open={contentModalVisible}
        onCancel={closeContentModal}
        footer={[
          <Button key="close" onClick={closeContentModal}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        <div style={{ marginBottom: "20px" }}>
          <h3>Tổng số: {stats.totalBlogs + stats.totalNews}</h3>
          <Table
            dataSource={[
              {
                key: '1',
                type: 'Bài viết (Blog)',
                count: stats.totalBlogs,
                percentage: Math.round((stats.totalBlogs / (stats.totalBlogs + stats.totalNews)) * 100) + "%"
              },
              {
                key: '2',
                type: 'Tin tức (News)',
                count: stats.totalNews,
                percentage: Math.round((stats.totalNews / (stats.totalBlogs + stats.totalNews)) * 100) + "%"
              }
            ]}
            columns={[
              {
                title: "Loại nội dung",
                dataIndex: "type",
                key: "type",
                render: (type) => (
                  <Tag
                    color={
                      type.includes("Blog") ? "#faad14" : "#1890ff"
                    }
                  >
                    {type}
                  </Tag>
                )
              },
              {
                title: "Số lượng",
                dataIndex: "count",
                key: "count",
              },
              {
                title: "Tỷ lệ",
                dataIndex: "percentage",
                key: "percentage",
              }
            ]}
            pagination={false}
          />
        </div>
        <div className="modal-chart">
          <Pie
            data={[
              { type: "Bài viết", value: stats.totalBlogs },
              { type: "Tin tức", value: stats.totalNews }
            ]}
            angleField="value"
            colorField="type"
            radius={0.8}
            label={{
              type: "outer",
              content: "{name}: {percentage}",
            }}
            interactions={[{ type: "element-active" }]}
            legend={{ position: "bottom" }}
            color={["#faad14", "#1890ff"]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
