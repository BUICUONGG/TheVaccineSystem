import { useState, useEffect } from "react";
import { Table, Input, Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllCustomerPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchText]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
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

      if (response.data.result) {
        const customerUsers = response.data.result.filter(user => user.role === "customer");
        setUsers(customerUsers);
        setFilteredUsers(customerUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Modal.error({
        content: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    Modal.confirm({
      title: `Xóa "${username}"?`,
      content: "Bạn có chắc chắn muốn xóa người dùng này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const accesstoken = localStorage.getItem("accesstoken");
          await axios.post(
            `http://localhost:8080/user/delete/${userId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accesstoken}`,
              },
            }
          );
          Modal.success({
            content: "User deleted successfully",
          });
          fetchUsers(); // Refresh the list
        } catch (error) {
          console.error("Error deleting user:", error);
          Modal.error({
            content: error.response?.data || "Failed to delete user",
          });
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
      title: "Password",
      dataIndex: "password",
      key: "password",
      render: () => "•••••••",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ marginRight: 8, backgroundColor: "#52c41a" }}
            onClick={() => showDetailsModal(record)}
          >
            Details
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id, record.username)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const showDetailsModal = (user) => {
    setSelectedUser(user);
    setIsDetailsModalVisible(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customer List</h2>
      <Input
        placeholder="Search by username"
        allowClear
        onChange={handleSearch}
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

      <Modal
        title="User Details"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedUser && (
          <div>
            <p><strong>Username:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllCustomerPage;
