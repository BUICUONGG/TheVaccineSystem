import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'antd';
import axios from 'axios';
import './adminPage.css';

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userList, setUserList] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 70,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/user/showInfo");
      setUserList(response.data.result || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowUsers = () => {
    setShowTable(true);
    fetchUsers();
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="admin-info">
          <div className="admin-icon">👤</div>
          <span className="admin-name">adminName</span>
        </div>
        
        <ul className="menu-items">
          <li className="menu-item">
            <Link to="/admin/overview">Overview</Link>
          </li>
          <li className="menu-item">
            <span onClick={handleShowUsers} style={{ cursor: 'pointer' }}>
              Show Users
            </span>
          </li>
          <li className="menu-item">
            <Link to="/admin/vaccines">Vaccines</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/feedback">Feedback</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/appointments">Appointments</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/consultations">Consultations</Link>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <header className="header">
          <nav className="navigation">
            <span className="nav-item">Home</span>
            <span className="nav-item">Contact</span>
          </nav>
          <input
            type="text"
            className="search-bar"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </header>
        <main className="content">
          {showTable && (
            <div style={{ padding: "20px" }}>
              <h2>User List</h2>
              <Table 
                dataSource={userList} 
                columns={columns}
                loading={loading}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} users`,
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
