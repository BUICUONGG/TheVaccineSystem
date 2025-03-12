import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Table, Spin, Alert, Button, Tag, Progress, Tooltip } from "antd";
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
  CloseCircleOutlined
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import axiosInstance from "../../../service/api";
import moment from "moment";

const OverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userList: [],
    totalVaccines: 0,
    totalBlogs: 0,
    totalCustomers: 0,
    totalAppointments: 0,
    totalFeedback: 0,
    recentAppointments: [],
    recentVaccines: [],
    appointmentStats: {
      pending: 0,
      approved: 0,
      completed: 0,
      incomplete: 0
    },
    feedbackStats: {
      averageRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStars: 0
    },
    monthlyAppointments: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const accesstoken = localStorage.getItem("accesstoken");

      // Fetch all data in parallel
      const [
        usersResponse, 
        vaccinesResponse, 
        blogsResponse,
        appointmentsLeResponse,
        appointmentsGoiResponse,
        feedbackResponse
      ] = await Promise.all([
        axiosInstance.get("/user/showInfo", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }),
        axiosInstance.get("/vaccine/showInfo", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }),
        axiosInstance.get("/blogs/showBlog", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }),
        axiosInstance.get("/appointmentLe/getdetailallaptle", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(() => ({ data: [] })),
        axiosInstance.get("/appointmentGoi/showDetailAptGoi", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(() => ({ data: [] })),
        axiosInstance.get("/feedback/getAllFeedback", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(() => ({ data: [] }))
      ]);

      const sortedUsers = Array.isArray(usersResponse.data) 
        ? usersResponse.data 
        : (usersResponse.data.result || []);
      
      const totalCustomers = sortedUsers.filter(
        (user) => user.role === "customer"
      ).length;

      // Process appointments
      const appointmentsLe = Array.isArray(appointmentsLeResponse.data) 
        ? appointmentsLeResponse.data 
        : [];
      
      const appointmentsGoi = Array.isArray(appointmentsGoiResponse.data) 
        ? appointmentsGoiResponse.data 
        : [];
      
      const allAppointments = [...appointmentsLe, ...appointmentsGoi];
      const totalAppointments = allAppointments.length;

      // Calculate appointment statistics
      const appointmentStats = {
        pending: allAppointments.filter(a => a.status === "pending").length,
        approved: allAppointments.filter(a => a.status === "approve").length,
        completed: allAppointments.filter(a => a.status === "completed").length,
        incomplete: allAppointments.filter(a => a.status === "incomplete").length
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
      const recentVaccines = Array.isArray(vaccinesResponse.data) 
        ? vaccinesResponse.data.slice(0, 5) 
        : [];

      // Process feedback data
      const feedbacks = Array.isArray(feedbackResponse.data) 
        ? feedbackResponse.data 
        : [];
      
      const totalFeedback = feedbacks.length;
      
      // Calculate feedback statistics
      const ratingSum = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = totalFeedback > 0 ? (ratingSum / totalFeedback).toFixed(1) : 0;
      
      const feedbackStats = {
        averageRating,
        fiveStars: feedbacks.filter(f => f.rating === 5).length,
        fourStars: feedbacks.filter(f => f.rating === 4).length,
        threeStars: feedbacks.filter(f => f.rating === 3).length,
        twoStars: feedbacks.filter(f => f.rating === 2).length,
        oneStars: feedbacks.filter(f => f.rating === 1).length
      };

      // Calculate monthly appointment data
      const monthlyAppointments = calculateMonthlyData(allAppointments);

      setStats({
        userList: sortedUsers,
        totalVaccines: Array.isArray(vaccinesResponse.data) ? vaccinesResponse.data.length : 0,
        totalBlogs: Array.isArray(blogsResponse.data) ? blogsResponse.data.length : 0,
        totalCustomers,
        totalAppointments,
        totalFeedback,
        recentAppointments,
        recentVaccines,
        appointmentStats,
        feedbackStats,
        monthlyAppointments
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly data for appointments
  const calculateMonthlyData = (appointments) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data structure
    const monthlyData = months.map(month => ({
      month,
      completed: 0,
      pending: 0,
      total: 0
    }));
    
    // Count appointments by month
    appointments.forEach(appointment => {
      const date = new Date(appointment.date || appointment.createAt);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].total += 1;
        
        if (appointment.status === 'completed') {
          monthlyData[monthIndex].completed += 1;
        } else if (appointment.status === 'pending' || appointment.status === 'approve') {
          monthlyData[monthIndex].pending += 1;
        }
      }
    });
    
    return monthlyData;
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
      position: 'bottom',
    },
  };

  // Transform data for column chart
  const columnData = [];
  if (stats.monthlyAppointments) {
    stats.monthlyAppointments.forEach(item => {
      columnData.push(
        { month: item.month, value: item.completed, type: 'Completed' },
        { month: item.month, value: item.pending, type: 'Pending' }
      );
    });
  }

  const columnConfig = {
    data: columnData,
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
        { type: 'adjust-color' },
      ],
    },
  };

  // Recent appointments columns
  const appointmentColumns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => {
        const customerName = 
          record.customer?.customerName || 
          record.customerDetails?.customerName || 
          record.cusId?.customerName || 
          record.cusId?.name || 
          "N/A";
        return customerName;
      },
    },
    {
      title: 'Loại',
      key: 'type',
      render: (_, record) => record.vaccineId ? 'Lẻ' : 'Gói',
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date || "N/A",
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'default';
        let text = 'Không xác định';
        
        switch (status) {
          case 'completed':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'incomplete':
            color = 'red';
            text = 'Đã hủy';
            break;
          case 'pending':
            color = 'orange';
            text = 'Đang chờ';
            break;
          case 'approve':
            color = 'blue';
            text = 'Đã duyệt';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // Recent vaccines columns
  const vaccineColumns = [
    {
      title: 'Tên vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName',
    },
    {
      title: 'Nhà sản xuất',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_, record) => {
        if (record.vaccineImports && record.vaccineImports.length > 0) {
          return `${record.vaccineImports[0].price.toLocaleString()} VNĐ`;
        }
        return "Chưa có giá";
      },
    },
  ];

  // Feedback rating distribution
  const feedbackRatingData = [
    { type: '5 sao', value: stats.feedbackStats.fiveStars },
    { type: '4 sao', value: stats.feedbackStats.fourStars },
    { type: '3 sao', value: stats.feedbackStats.threeStars },
    { type: '2 sao', value: stats.feedbackStats.twoStars },
    { type: '1 sao', value: stats.feedbackStats.oneStars },
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
      position: 'bottom',
    },
    color: ['#52c41a', '#91d5ff', '#faad14', '#ff7a45', '#f5222d'],
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Tổng quan hệ thống</h2>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchData}
        >
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={stats.userList.length}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Vaccine"
              value={stats.totalVaccines}
              prefix={<ExperimentOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Bài viết"
              value={stats.totalBlogs}
              prefix={<FileTextOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Lịch hẹn"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined style={{ color: "#13c2c2" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8} lg={4}>
          <Card>
            <Statistic
              title="Đánh giá"
              value={stats.totalFeedback}
              prefix={<CommentOutlined style={{ color: "#eb2f96" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Appointment Status Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Đang chờ duyệt"
              value={stats.appointmentStats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
              suffix={<small>/{stats.totalAppointments}</small>}
            />
            <Progress 
              percent={Math.round((stats.appointmentStats.pending / stats.totalAppointments) * 100) || 0} 
              strokeColor="#faad14" 
              showInfo={false}
              status="active"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.appointmentStats.approved}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
              suffix={<small>/{stats.totalAppointments}</small>}
            />
            <Progress 
              percent={Math.round((stats.appointmentStats.approved / stats.totalAppointments) * 100) || 0} 
              strokeColor="#1890ff" 
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.appointmentStats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={<small>/{stats.totalAppointments}</small>}
            />
            <Progress 
              percent={Math.round((stats.appointmentStats.completed / stats.totalAppointments) * 100) || 0} 
              strokeColor="#52c41a" 
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.appointmentStats.incomplete}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseCircleOutlined />}
              suffix={<small>/{stats.totalAppointments}</small>}
            />
            <Progress 
              percent={Math.round((stats.appointmentStats.incomplete / stats.totalAppointments) * 100) || 0} 
              strokeColor="#f5222d" 
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="Phân bố người dùng">
            <div style={{ height: "300px" }}>
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Lịch hẹn theo tháng">
            <div style={{ height: "300px" }}>
              <Column {...columnConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Feedback and Appointments */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Đánh giá khách hàng</span>
                <Tooltip title="Điểm đánh giá trung bình">
                  <Tag color="#722ed1" style={{ marginLeft: 8 }}>
                    <StarOutlined /> {stats.feedbackStats.averageRating}/5
                  </Tag>
                </Tooltip>
              </div>
            }
          >
            <div style={{ height: "300px" }}>
              <Pie {...feedbackPieConfig} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Lịch hẹn gần đây">
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
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24}>
          <Card title="Vaccine mới nhất">
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
    </div>
  );
};

export default OverviewPage;
