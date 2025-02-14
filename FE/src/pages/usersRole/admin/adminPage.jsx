import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Table, Input, Button, Modal } from "antd";
import axios from "axios";
import { DeleteOutlined, LogoutOutlined } from "@ant-design/icons";
import "./adminPage.css";

const { Search } = Input;

const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userList, setUserList] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setAdminName(`Admin: ${username}`);
    }
  }, []);

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
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Staff", value: "staff" },
        { text: "Customer", value: "customer" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <span
          style={{
            textTransform: "capitalize",
            color:
              role === "admin"
                ? "#ff4d4f"
                : role === "staff"
                ? "#1890ff"
                : "#52c41a",
          }}
        >
          {role}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
          loading={deleteLoading}
          disabled={record.role === "admin"}
        >
          Delete
        </Button>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");

      const response = await axios.get("http://localhost:8080/user/showInfo", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      const sortedUsers = (response.data.result || []).sort((a, b) => {
        const roleOrder = {
          admin: 1,
          staff: 2,
          customer: 3,
        };
        return roleOrder[a.role] - roleOrder[b.role];
      });
      setUserList(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Unauthorized. Please login again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowUsers = () => {
    setShowTable(true);
    fetchUsers();
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredUsers = userList.filter((user) =>
    user.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async (userId) => {
    const accesstoken = localStorage.getItem("accesstoken");

    if (!accesstoken) {
      Modal.error({
        content: "You need to login first",
      });
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setDeleteLoading(true);
          console.log('Deleting user with ID:', userId); // Debug log

          const response = await axios.post(
            `http://localhost:8080/user/delete/${userId}`,
            {}, // empty body
            {
              headers: {
                Authorization: `Bearer ${accesstoken}`,
              },
            }
          );
          
          fetchUsers();
          
          Modal.success({
            content: "User deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          if (error.response?.status === 401) {
            Modal.error({
              content: "Unauthorized. Please login again.",
            });
            navigate('/login');
          } else if (error.response?.status === 403) {
            Modal.error({
              content: "You do not have permission to delete users.",
            });
          } else {
            Modal.error({
              content: "Failed to delete user",
            });
          }
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="admin-info">
          <div className="admin-icon">👤</div>
          <span className="admin-name">{adminName}</span>
        </div>

        <ul className="menu-items">
          <li className="menu-item">
            <Link 
              to="/admin/overview"
              className={location.pathname === "/admin/overview" ? "active" : ""}
            >
              Overview
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              to="/admin/accounts"
              className={location.pathname === "/admin/accounts" ? "active" : ""}
            >
              Accounts
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              to="/admin/vaccines"
              className={location.pathname === "/admin/vaccines" ? "active" : ""}
            >
              Vaccines
            </Link>
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

        <div className="logout-section">
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="main-content">
        <header className="header">
          <nav className="navigation">
            <span className="nav-item">Home</span>
            <span className="nav-item">Contact</span>
          </nav>
        </header>
        <main className="content">
          {showTable && (
            <div style={{ padding: "20px" }}>
              <h2>User List</h2>
              <Search
                placeholder="Search by username"
                allowClear
                enterButton
                onSearch={handleSearch}
                style={{ width: 300, marginBottom: 16 }}
              />
              <Table
                dataSource={filteredUsers}
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
