import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Popconfirm, ConfigProvider } from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../service/api";

const { Search } = Input;

const AccountsPage = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      const response = await axiosInstance.get("/user/showInfo", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      const users = Array.isArray(response.data)
        ? response.data
        : response.data.result || [];

      const sortedUsers = users.sort((a, b) => {
        const roleOrder = {
          admin: 1,
          staff: 2,
          customer: 3,
        };
        return roleOrder[a.role] - roleOrder[b.role];
      });

      setUserList(sortedUsers);
      setFilteredUsers(sortedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Unauthorized. Please login again.",
        });
      } else {
        Modal.error({
          content:
            error.response?.data?.message ||
            "Không thể tải danh sách người dùng",
        });
      }
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
      await axiosInstance.post(
        `/user/delete/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );
      await fetchUsers();
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

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 70,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mật khẩu",
      dataIndex: "password",
      key: "password",
      render: () => "•••••",
    },
    {
      title: "Vai trò",
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
              role === "admin" ? "#ff4d4f" :
                role === "staff" ? "#1890ff" : "#52c41a"
          }}
        >{role}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xóa tài khoản"
          description="Chắc chắn muốn xóa tài khoản này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Có" okButtonProps={{style: {width: '60px'}}} okType="danger"
          cancelText="Không" cancelButtonProps={{style: {width: '60px' }}}
          disabled={record.role === "admin"}
          >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={record.role === "admin"}
          ></Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", }}>
        <h2>Quản lý tài khoản</h2>
      </div>
        <div className="search-container">
        <Search
          placeholder="Tìm kiếm theo tên đăng nhập"
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          className="search-input"
        />
      </div>
      <Table
        dataSource={filteredUsers}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{
          showTotal: (total) => `Total ${total} users`,
        }} />
    </div>
  );
};

export default AccountsPage;