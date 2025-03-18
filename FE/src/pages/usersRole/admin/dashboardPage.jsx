import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Table, Spin, Alert, Button, Tag, Progress, Tooltip, Divider, Modal } from "antd";
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
  TeamOutlined,
  MedicineBoxOutlined,
  MoneyCollectOutlined,
  SolutionOutlined,
  ReadOutlined,
  PieChartOutlined
} from "@ant-design/icons";
import { Pie, Column, Line } from "@ant-design/plots";
import axiosInstance from "../../../service/api";
import { Link } from "react-router-dom";

const OverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userList: [],
    totalVaccines: 0,
    totalBlogs: 0,
    totalNews: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalAppointments: 0,
    totalFeedback: 0,
    recentAppointments: [],
    recentVaccines: [],
    recentBlogs: [],
    recentNews: [],
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
    paymentStats: {
      paid: 0,
      pending: 0,
      total: 0
    },
    monthlyAppointments: [],
    revenueData: []
  });
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const accesstoken = localStorage.getItem("accesstoken");

      // Fetch all data in parallel with better error handling
      const [
        usersResponse, 
        vaccinesResponse, 
        blogsResponse,
        newsResponse,
        appointmentsLeResponse,
        appointmentsGoiResponse,
        feedbackResponse,
        staffResponse
      ] = await Promise.all([
        axiosInstance.get("/user/showInfo", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(error => {
          console.error("Error fetching users:", error);
          return { data: [] };
        }),
        axiosInstance.get("/vaccine/showInfo", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(error => {
          console.error("Error fetching vaccines:", error);
          return { data: [] };
        }),
        axiosInstance.get("/blog/showBlog", {
          headers: { Authorization: `Bearer ${accesstoken}` },
          params: {
            includeDeleted: true
          }
        }).catch(error => {
          console.error("Error fetching blogs:", error);
          return { data: { blogs: [], total: 0 } };
        }),
        axiosInstance.get("/news/getAllNews", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(error => {
          console.error("Error fetching news:", error);
          return { data: { result: [] } };
        }),
        axiosInstance.get("/appointmentLe/getdetailallaptle", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(error => {
          console.error("Error fetching appointment Le:", error);
          return { data: [] };
        }),
        axiosInstance.get("/appointmentGoi/showDetailAptGoi", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(error => {
          console.error("Error fetching appointment Goi:", error);
          return { data: [] };
        }),
        axiosInstance.get("/feedback/getAllFeedback", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(error => {
          console.error("Error fetching feedback:", error);
          return { data: [] };
        }),
        axiosInstance.get("/staff/getliststaff", {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }).catch(error => {
          console.error("Error fetching staff:", error);
          return { data: [] };
        })
      ]);

      const sortedUsers = Array.isArray(usersResponse.data) 
        ? usersResponse.data 
        : (usersResponse.data.result || []);
      
      const totalCustomers = sortedUsers.filter(
        (user) => user.role === "customer"
      ).length;

      const totalStaff = Array.isArray(staffResponse.data) 
        ? staffResponse.data.length 
        : (staffResponse.data?.result?.length || 0);

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

      // Calculate payment statistics
      const paymentStats = {
        paid: allAppointments.filter(a => a.status === "Paid" || a.status === "completed").length,
        pending: allAppointments.filter(a => a.status === "Pending" || a.status === "pending").length,
        total: allAppointments.length
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

      // Get recent blogs
      const recentBlogs = blogsResponse.data && blogsResponse.data.blogs
        ? blogsResponse.data.blogs.slice(0, 3)
        : [];

      // Get recent news
      const recentNews = newsResponse.data && newsResponse.data.result 
        ? newsResponse.data.result.slice(0, 3)
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
      
      // Calculate revenue data (simulate revenue based on appointments)
      const revenueData = calculateRevenueData(allAppointments);

      setStats({
        userList: sortedUsers,
        totalVaccines: Array.isArray(vaccinesResponse.data) ? vaccinesResponse.data.length : 0,
        totalBlogs: blogsResponse.data && blogsResponse.data.total ? blogsResponse.data.total : 
                   (blogsResponse.data && blogsResponse.data.blogs ? blogsResponse.data.blogs.length : 0),
        totalNews: newsResponse.data && newsResponse.data.result ? newsResponse.data.result.length : 0,
        totalCustomers,
        totalStaff,
        totalAppointments,
        totalFeedback,
        recentAppointments,
        recentVaccines,
        recentBlogs,
        recentNews,
        appointmentStats,
        feedbackStats,
        paymentStats,
        monthlyAppointments,
        revenueData
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
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data structure
    const monthlyData = months.map(month => ({
      month,
      completed: 0,
      pending: 0,
      approved: 0,
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
        } else if (appointment.status === 'pending') {
          monthlyData[monthIndex].pending += 1;
        } else if (appointment.status === 'approve') {
          monthlyData[monthIndex].approved += 1;
        }
      }
    });
    
    return monthlyData;
  };

  // Calculate revenue data based on appointments
  const calculateRevenueData = (appointments) => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data structure
    const revenueData = months.map(month => ({
      month,
      revenue: 0
    }));
    
    // Calculate revenue by month
    appointments.forEach(appointment => {
      const date = new Date(appointment.date || appointment.createAt);
      if (date.getFullYear() === currentYear && 
         (appointment.status === 'completed' || appointment.status === 'Paid')) {
        const monthIndex = date.getMonth();
        // Use price if available, otherwise use a default average price
        const price = appointment.price || appointment.vaccineId?.price || 500000;
        revenueData[monthIndex].revenue += price;
      }
    });
    
    return revenueData;
  };

  // Tính toán số lượng người dùng theo role
  const roleCount = stats.userList.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(roleCount).map(([type, value]) => ({
    type: type === 'customer' ? 'Khách hàng' : 
          type === 'admin' ? 'Quản trị viên' : 
          type === 'staff' ? 'Nhân viên' : type.charAt(0).toUpperCase() + type.slice(1),
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
        { month: item.month, value: item.completed, type: 'Hoàn thành' },
        { month: item.month, value: item.approved, type: 'Đã duyệt' },
        { month: item.month, value: item.pending, type: 'Đang chờ' }
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
    color: ['#52c41a', '#1890ff', '#faad14'],
    label: {
      position: 'middle',
      layout: [
        { type: 'interval-adjust-position' },
        { type: 'interval-hide-overlap' },
        { type: 'adjust-color' },
      ],
    },
  };

  // Revenue line chart
  const lineData = stats.revenueData.map(item => ({
    month: item.month,
    value: item.revenue
  }));

  const lineConfig = {
    data: lineData,
    xField: 'month',
    yField: 'value',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      formatter: (text) => `${text.value.toLocaleString()} VNĐ`,
    },
    color: '#1890ff',
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
          case 'Paid':
            color = 'cyan';
            text = 'Đã thanh toán';
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
        if (record.vaccineImports && 
            record.vaccineImports.length > 0 && 
            record.vaccineImports[0].price) {
          return `${record.vaccineImports[0].price.toLocaleString()} VNĐ`;
        }
        return "Chưa có giá";
      },
    },
  ];

  // Blog and news columns
  const blogColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Ngày đăng',
      key: 'createdAt',
      render: (_, record) => {
        const date = record.createdAt ? new Date(record.createdAt) : null;
        return date ? date.toLocaleDateString('vi-VN') : 'N/A';
      },
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      render: (author) => author || 'Admin',
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
        <p>Đang tải dữ liệu thống kê...</p>
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

      {/* Stats Cards - row 1*/}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => setIsUserModalVisible(true)}
            style={{ cursor: 'pointer', height: '180px' }}
          >
            <Statistic
              title="Tổng người dùng"
              value={stats.userList.length}
              prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Tooltip title={`Quản trị viên: ${roleCount['admin'] || 0}`}>
                <Progress 
                  type="circle"
                  percent={Math.round((roleCount['admin'] || 0) / stats.userList.length * 100) || 0}
                  width={40}
                  strokeColor="#1890ff"
                  format={() => 'Admin'}
                />
              </Tooltip>
              <Tooltip title={`Nhân viên: ${roleCount['staff'] || 0}`}>
                <Progress 
                  type="circle"
                  percent={Math.round((roleCount['staff'] || 0) / stats.userList.length * 100) || 0}
                  width={40}
                  strokeColor="#52c41a"
                  format={() => 'Staff'}
                />
              </Tooltip>
              <Tooltip title={`Khách hàng: ${stats.totalCustomers}`}>
                <Progress 
                  type="circle"
                  percent={Math.round((stats.totalCustomers / stats.userList.length * 100) || 0)}
                  width={40}
                  strokeColor="#722ed1"
                  format={() => 'User'}
                />
              </Tooltip>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '180px' }}>
            <Statistic
              title="Vaccine"
              value={stats.totalVaccines}
              prefix={<MedicineBoxOutlined style={{ color: "#722ed1" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Link to="/admin/vaccines" style={{ display: 'block', textAlign: 'center' }}>
              <Button type="link">Xem danh sách vaccine</Button>
            </Link>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '180px' }}>
            <Statistic
              title="Đánh giá"
              value={stats.totalFeedback}
              prefix={<CommentOutlined style={{ color: "#eb2f96" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Statistic 
                title="Điểm trung bình" 
                value={stats.feedbackStats.averageRating}
                suffix="/5"
                prefix={<StarOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ fontSize: '16px', color: "#faad14" }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '180px' }}>
            <Statistic
              title="Nội dung"
              value={stats.totalBlogs + stats.totalNews}
              prefix={<FileTextOutlined style={{ color: "#faad14" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Statistic 
                title="Cẩm nang" 
                value={stats.totalBlogs}
                valueStyle={{ fontSize: '14px' }}
              />
              <Statistic 
                title="Tin tức" 
                value={stats.totalNews}
                valueStyle={{ fontSize: '14px' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards - row 2 */}
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '180px' }}>
            <Statistic
              title="Lịch hẹn"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined style={{ color: "#13c2c2" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Progress 
              percent={Math.round((stats.appointmentStats.completed / stats.totalAppointments) * 100) || 0}
              strokeColor="#52c41a"
              format={(percent) => `${percent}% hoàn thành`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '180px' }}>
            <Statistic
              title="Hoàn thành lịch hẹn"
              value={stats.appointmentStats.completed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Progress 
              percent={Math.round((stats.appointmentStats.completed / stats.totalAppointments) * 100) || 0}
              strokeColor="#52c41a"
              format={(percent) => `${percent}%`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '180px' }}>
            <Statistic
              title="Chờ duyệt"
              value={stats.appointmentStats.pending}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Progress 
              percent={Math.round((stats.appointmentStats.pending / stats.totalAppointments) * 100) || 0}
              strokeColor="#faad14"
              format={(percent) => `${percent}%`}
              status="active"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: '180px' }}>
            <Statistic
              title="Đã duyệt"
              value={stats.appointmentStats.approved}
              prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Progress 
              percent={Math.round((stats.appointmentStats.approved / stats.totalAppointments) * 100) || 0}
              strokeColor="#1890ff"
              format={(percent) => `${percent}%`}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
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

      {/* Charts Row 2 */}
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
          <Card title="Doanh thu theo tháng (VNĐ)">
            <div style={{ height: "300px" }}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Data Tables */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Lịch hẹn gần đây" 
            extra={<Link to="/staffLayout/appointments">Xem tất cả</Link>}
          >
            <Table 
              dataSource={stats.recentAppointments} 
              columns={appointmentColumns} 
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Vaccine mới nhất"
            extra={<Link to="/admin/vaccines">Xem tất cả</Link>}
          >
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

      {/* Blog and News Section */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Cẩm nang mới nhất" 
            extra={<Link to="/admin/blogManagement">Xem tất cả</Link>}
          >
            <Table 
              dataSource={stats.recentBlogs} 
              columns={blogColumns} 
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Tin tức mới nhất"
            extra={<Link to="/admin/newsManagement">Xem tất cả</Link>}
          >
            <Table 
              dataSource={stats.recentNews} 
              columns={blogColumns} 
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Modal for detailed user stats */}
      <Modal 
        title="Thống kê người dùng chi tiết" 
        open={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Quản trị viên"
                value={roleCount['admin'] || 0}
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              />
              <Divider style={{ margin: '12px 0' }} />
              <Progress 
                percent={Math.round((roleCount['admin'] || 0) / stats.userList.length * 100) || 0}
                strokeColor="#1890ff"
                format={(percent) => `${percent}% người dùng`}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Nhân viên"
                value={roleCount['staff'] || 0}
                prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
              />
              <Divider style={{ margin: '12px 0' }} />
              <Progress 
                percent={Math.round((roleCount['staff'] || 0) / stats.userList.length * 100) || 0}
                strokeColor="#52c41a"
                format={(percent) => `${percent}% người dùng`}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Khách hàng"
                value={stats.totalCustomers}
                prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              />
              <Divider style={{ margin: '12px 0' }} />
              <Progress 
                percent={Math.round((stats.totalCustomers / stats.userList.length) * 100) || 0}
                strokeColor="#722ed1"
                format={(percent) => `${percent}% người dùng`}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Row>
          <Col span={24}>
            <Card title="Phân bố người dùng">
              <div style={{ height: "300px" }}>
                <Pie {...pieConfig} />
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default OverviewPage;
