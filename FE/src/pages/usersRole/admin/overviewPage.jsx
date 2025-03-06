import { useState, useEffect } from "react";
import { Card, Row, Col, Modal } from "antd";
import {
  UserOutlined,
  ExperimentOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
// import axios from "axios";
import { Pie } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../service/api";

const OverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userList: [],
    totalVaccines: 0,
    totalBlogs: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");

      const [usersResponse, vaccinesResponse, blogsResponse] =
        await Promise.all([
          axiosInstance.get("http://localhost:8080/user/showInfo", {
            headers: { Authorization: `Bearer ${accesstoken}` },
          }),
          axiosInstance.get("http://localhost:8080/vaccine/showInfo", {
            headers: { Authorization: `Bearer ${accesstoken}` },
          }),
          axiosInstance.get("http://localhost:8080/blogs/showBlog", {
            headers: { Authorization: `Bearer ${accesstoken}` },
          }),
        ]);

      const sortedUsers = (usersResponse.data.result || []).sort((a, b) => {
        const roleOrder = { admin: 1, staff: 2, customer: 3 };
        return roleOrder[a.role] - roleOrder[b.role];
      });

      const totalCustomers = sortedUsers.filter(
        (user) => user.role === "customer"
      ).length;

      setStats({
        userList: sortedUsers,
        totalVaccines: vaccinesResponse.data.length,
        totalBlogs: blogsResponse.data.length,
        totalCustomers,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Unauthorized. Please login again.",
        });
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
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
  };

  // Thêm dữ liệu mẫu cho thống kê doanh thu
  const revenueStats = {
    vaccinesSold: {
      quantity: 1234,
      revenue: 2500000000,
    },
    appointments: {
      quantity: 789,
      revenue: 9123,
    },
    expenses: {
      vaccineStock: 800000000,
      operational: 200000000,
      marketing: 150000000,
    },
    vaccineStock: {
      inStock: 567,
      onOrder: 200,
      lastImport: {
        date: "2024-03-15",
        quantity: 300,
        cost: 450000000,
      },
    },
  };

  // Format số tiền thành VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Dashboard Overview</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <h3>Total Users</h3>
              <h2>{stats.userList.length}</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <UserOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
              <h3>Total Customers</h3>
              <h2>{stats.totalCustomers}</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <ExperimentOutlined
                style={{ fontSize: "24px", color: "#722ed1" }}
              />
              <h3>Total Vaccines</h3>
              <h2>{stats.totalVaccines}</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <FileTextOutlined
                style={{ fontSize: "24px", color: "#faad14" }}
              />
              <h3>Total Blogs</h3>
              <h2>{stats.totalBlogs}</h2>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={12}>
          <Card>
            <h3>User Role Distribution</h3>
            <div style={{ height: "400px" }}>
              <Pie {...pieConfig} />
            </div>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              Total {stats.userList.length} users
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card>
            <h3>Revenue Overview</h3>
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "#1890ff" }}>Sales Revenue</h4>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>
                    Vaccines Sold ({revenueStats.vaccinesSold.quantity} units)
                  </Col>
                  <Col style={{ color: "#52c41a", fontWeight: "bold" }}>
                    {formatCurrency(revenueStats.vaccinesSold.revenue)}
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col>Appointments ({revenueStats.appointments.quantity})</Col>
                  <Col style={{ color: "#52c41a", fontWeight: "bold" }}>
                    {formatCurrency(revenueStats.appointments.revenue)}
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "#ff4d4f" }}>Expenses</h4>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>Vaccine Stock</Col>
                  <Col style={{ color: "#ff4d4f" }}>
                    {formatCurrency(revenueStats.expenses.vaccineStock)}
                  </Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>Operational Costs</Col>
                  <Col style={{ color: "#ff4d4f" }}>
                    {formatCurrency(revenueStats.expenses.operational)}
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col>Marketing</Col>
                  <Col style={{ color: "#ff4d4f" }}>
                    {formatCurrency(revenueStats.expenses.marketing)}
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ color: "#722ed1" }}>Vaccine Inventory</h4>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>Current Stock</Col>
                  <Col>{revenueStats.vaccineStock.inStock} units</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>On Order</Col>
                  <Col>{revenueStats.vaccineStock.onOrder} units</Col>
                </Row>
              </div>

              <div>
                <h4 style={{ color: "#faad14" }}>Last Import</h4>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>Date</Col>
                  <Col>{revenueStats.vaccineStock.lastImport.date}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Col>Quantity</Col>
                  <Col>
                    {revenueStats.vaccineStock.lastImport.quantity} units
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col>Cost</Col>
                  <Col style={{ color: "#ff4d4f" }}>
                    {formatCurrency(revenueStats.vaccineStock.lastImport.cost)}
                  </Col>
                </Row>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: "24px",
                }}
              >
                <Row justify="space-between">
                  <Col>
                    <h3>Total Revenue</h3>
                  </Col>
                  <Col>
                    <h3 style={{ color: "#52c41a" }}>
                      {formatCurrency(
                        revenueStats.vaccinesSold.revenue +
                          revenueStats.appointments.revenue -
                          (revenueStats.expenses.vaccineStock +
                            revenueStats.expenses.operational +
                            revenueStats.expenses.marketing)
                      )}
                    </h3>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewPage;
