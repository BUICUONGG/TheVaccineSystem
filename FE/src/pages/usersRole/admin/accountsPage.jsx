import { useState, useEffect } from "react";
import { Table, Input, Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const AccountsPage = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Thêm state cho filtered users
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cập nhật filtered users khi userList hoặc searchText thay đổi
  useEffect(() => {
    const filtered = userList.filter(user => 
      user.username.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [userList, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");

      const response = await axios.get(
        "http://localhost:8080/user/showInfo",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      const sortedUsers = (response.data.result || []).sort((a, b) => {
        const roleOrder = {
          admin: 1,
          staff: 2,
          customer: 3,
        };
        return roleOrder[a.role] - roleOrder[b.role];
      });
      setUserList(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
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
          await axios.post(
            `http://localhost:8080/user/delete/${userId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accesstoken}`,
              },
            }
          );

          await fetchUsers(); // Refresh the list after deletion
          Modal.success({
            content: "User deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          if (error.response?.status === 401) {
            Modal.error({
              content: "Unauthorized. Please login again.",
            });
            navigate("/login");
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Accounts Management</h2>
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
  );
};

export default AccountsPage; 