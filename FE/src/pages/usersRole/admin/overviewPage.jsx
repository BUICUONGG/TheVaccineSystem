import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin } from 'antd';
import { UserOutlined, ExperimentOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Pie } from '@ant-design/plots';

const OverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVaccines: 0,
    totalBlogs: 0,
    userRoles: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customers, vaccines, blogs, users] = await Promise.all([
        axios.get('http://localhost:8080/customer/getAllCustomer'),
        axios.get('http://localhost:8080/vaccine/showInfo'),
        axios.get('http://localhost:8080/blog/showBlog'),
        axios.get('http://localhost:8080/users/showInfo')
      ]);

      // Count users by role
      const roleCount = users.data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      const userRoles = Object.entries(roleCount).map(([type, value]) => ({
        type,
        value
      }));

      setStats({
        totalCustomers: customers.data.length,
        totalVaccines: vaccines.data.length,
        totalBlogs: blogs.data.length,
        userRoles
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieConfig = {
    data: stats.userRoles,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  if (loading) {
    return <Spin size="large" className="center-spinner" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2>Dashboard Overview</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <h3>Total Customers</h3>
              <h2>{stats.totalCustomers}</h2>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ExperimentOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              <h3>Total Vaccines</h3>
              <h2>{stats.totalVaccines}</h2>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: '24px', color: '#faad14' }} />
              <h3>Total Blogs</h3>
              <h2>{stats.totalBlogs}</h2>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px' }}>
        <h3>User Role Distribution</h3>
        <div style={{ height: '400px' }}>
          <Pie {...pieConfig} />
        </div>
      </Card>
    </div>
  );
};

export default OverviewPage; 