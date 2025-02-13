import { Table } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomersTable.css';

const CustomersTable = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Customer ID',
      dataIndex: ['customerInfo', '0', 'customerId'],
      key: 'customerId',
      render: (text, record) => record.customerInfo[0]?.customerId || 'N/A'
    },
    {
      title: 'Gender',
      dataIndex: ['customerInfo', '0', 'gender'],
      key: 'gender',
      render: (text, record) => record.customerInfo[0]?.gender || 'N/A'
    }
  ];

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:YOUR_PORT/api/users/getAllUsers');
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="customers-table-container">
      <h2>Customers List</h2>
      <Table 
        columns={columns} 
        dataSource={customers}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />
    </div>
  );
};

export default CustomersTable; 