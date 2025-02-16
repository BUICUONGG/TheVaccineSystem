import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
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

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

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

  // const handleSearch = (value) => {
  //   setSearchText(value);
  // };
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
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      setDeleteLoading(true);
      
      const response = await axios.post(
        `http://localhost:8080/user/delete/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.status === 200) {
        // Xóa user khỏi state trực tiếp
        setUserList(prevUsers => prevUsers.filter(user => user._id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        
        Modal.success({
          content: "Xóa user thành công",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Modal.error({
        content: "Không thể xóa user",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    const accesstoken = localStorage.getItem("accesstoken");

    try {
      await axios.post(
        `http://localhost:8080/user/update/${editingUser._id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "User updated successfully",
      });
      setIsEditModalVisible(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user:", error);
      Modal.error({
        content: error.response?.data?.message || "Failed to update user",
      });
    }
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
    });
    setIsEditModalVisible(true);
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
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ backgroundColor: '#52c41a' }}
            onClick={() => showEditModal(record)}
            disabled={record.role === "admin"}
          >
            Update
          </Button>
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
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Accounts Management</h2>
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
        title="Edit User"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdate}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please input valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input phone!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Update
            </Button>
            <Button onClick={() => setIsEditModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountsPage; 