import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Popconfirm,
  Form,
  Select,
  message,
} from "antd";
import { DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;

const AccountsPage = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  // Thêm state cho filtered users
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cập nhật filtered users khi userList hoặc searchText thay đổi
  useEffect(() => {
    const filtered = userList.filter((user) =>
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

      if (!accesstoken) {
        Modal.error({
          content: "You need to login first",
        });
        return;
      }

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
        content: "Xóa tài khoản thành công!",
      });

      await fetchUsers(); // Refresh danh sách
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Unauthorized. Please login again.",
        });
        navigate("/login");
      } else {
        Modal.error({
          content: "Không thể xóa tài khoản",
        });
      }
    }
  };

  // Handle create staff modal
  const showCreateModal = () => {
    createForm.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
  };

  const handleCreateStaff = async (values) => {
    try {
      setCreateLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");

      if (!accesstoken) {
        Modal.error({
          content: "You need to login first",
        });
        return;
      }

      await axios.post("http://localhost:8080/staff/createStaff", values, {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      message.success("Tạo tài khoản nhân viên thành công!");
      setIsCreateModalVisible(false);
      await fetchUsers(); // Refresh danh sách
    } catch (error) {
      console.error("Error creating staff:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Unauthorized. Please login again.",
        });
        navigate("/login");
      } else {
        Modal.error({
          content:
            error.response?.data?.message ||
            "Không thể tạo tài khoản nhân viên",
        });
      }
    } finally {
      setCreateLoading(false);
    }
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
    // {
    //   title: "Full Name",
    //   dataIndex: "fullname",
    //   key: "fullname",
    // },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      render: () => "•••••••",
    },
    // {
    //   title: "Email",
    //   dataIndex: "email",
    //   key: "email",
    // },
    // {
    //   title: "Phone",
    //   dataIndex: "phone",
    //   key: "phone",
    // },
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
        <Popconfirm
          title="Xóa tài khoản"
          description="Bạn có chắc chắn muốn xóa tài khoản này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Có"
          cancelText="Không"
          okType="danger"
          disabled={record.role === "admin"}
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={record.role === "admin"}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2>User Accounts Management</h2>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={showCreateModal}
        >
          Create Staff
        </Button>
      </div>

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

      {/* Create Staff Modal */}
      <Modal
        title="Create Staff Account"
        open={isCreateModalVisible}
        onCancel={handleCreateCancel}
        footer={null}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateStaff}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            name="staffname"
            label="Staff Name"
            rules={[{ required: true, message: "Please input staff name!" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please input phone number!" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit phone number!",
              },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender!" }]}
          >
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCreateCancel} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={createLoading}>
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountsPage;
