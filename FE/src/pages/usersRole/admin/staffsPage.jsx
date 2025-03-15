import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Select, Popconfirm, ConfigProvider, Space, Tag, Tooltip, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../service/api";

const { Option } = Select;
const { Search } = Input;

const StaffsPage = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [detailStaff, setDetailStaff] = useState(null);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    const filtered = staffList.filter(
      (staff) =>
        staff.staffname?.toLowerCase().includes(searchText.toLowerCase()) ||
        staff.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        staff.phone?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredStaffs(filtered);
  }, [staffList, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const response = await axiosInstance.get("/staff/getliststaff", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      if (response.data) {
        const staffData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.result || []);
        
        setStaffList(staffData);
        setFilteredStaffs(staffData);
      }
    } catch (error) {
      console.error("Error fetching staffs:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
        navigate("/login");
      } else {
        Modal.error({
          content: "Không thể tải danh sách nhân viên",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      const staffData = {
        username: values.username?.trim(),
        password: values.password?.trim(),
        staffname: values.staffname?.trim(),
        phone: values.phone?.trim(),
        gender: values.gender?.toLowerCase(),
      };

      await axiosInstance.post("/staff/createStaff", staffData, {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      message.success("Thêm nhân viên thành công!");
      setIsCreateModalVisible(false);
      createForm.resetFields();
      fetchStaffs();
    } catch (error) {
      console.error("Error creating staff:", error);
      message.error(error.response?.data?.message || "Không thể thêm nhân viên");
    }
  };

  const handleUpdate = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");

      // Validate data before sending
      const updatedData = {
        staffId: editingStaff._id,
        staffname: values.staffname?.trim(),
        phone: values.phone?.trim(),
        gender: values.gender?.toLowerCase(),
      };

      await axiosInstance.post("/staff/updateStaff", updatedData, {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      message.success("Cập nhật thông tin nhân viên thành công!");
      setIsEditModalVisible(false);
      fetchStaffs();
    } catch (error) {
      console.error("Error updating staff:", error);
      message.error(error.response?.data?.message || "Không thể cập nhật thông tin nhân viên");
    }
  };

  const handleDelete = async (staffId) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");

      if (!accesstoken) {
        Modal.error({
          content: "Bạn cần đăng nhập lại",
        });
        return;
      }

      await axiosInstance.post(
        "/staff/deleteStaff",
        { staffId },
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      message.success("Xóa nhân viên thành công!");
      await fetchStaffs(); 
    } catch (error) {
      console.error("Error deleting staff:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
        navigate("/login");
      } else {
        message.error("Không thể xóa nhân viên");
      }
    }
  };

  const showDetailModal = (staff) => {
    setDetailStaff(staff);
    setIsDetailModalVisible(true);
  };

  const showEditModal = (staff) => {
    setEditingStaff(staff);
    editForm.setFieldsValue({
      staffname: staff.staffname,
      phone: staff.phone,
      gender: staff.gender ? staff.gender.charAt(0).toUpperCase() + staff.gender.slice(1) : undefined,
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
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Họ và tên",
      dataIndex: "staffname",
      key: "staffname",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        const genderMap = {
          male: "Nam",
          female: "Nữ",
          other: "Khác",
        };
        return <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'pink' : 'default'}>
          {genderMap[gender] || "Chưa cập nhật"}
        </Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ backgroundColor: "#52c41a" }}
            onClick={() => showEditModal(record)}
          >
            Cập nhật
          </Button>
          <Popconfirm
            title="Xóa nhân viên"
            description="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
            okButtonProps={{ style: { width: '60px' } }}
            cancelButtonProps={{ style: { width: '60px' } }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Popconfirm: {
            actionButtonMarginInlineStart: 8,
            minWidth: 70,
            zIndexPopup: 1050,
          },
        },
      }}
    >
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2>Quản lý nhân viên</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              createForm.resetFields();
              setIsCreateModalVisible(true);
            }}
          >
            Thêm nhân viên mới
          </Button>
        </div>

        <div className="search-container" style={{ marginBottom: "16px" }}>
          <Search
            placeholder="Tìm kiếm theo tên, username hoặc số điện thoại"
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            className="search-input"
            style={{ width: 350 }}
          />
        </div>

        <Table
          dataSource={filteredStaffs}
          columns={columns}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
        />

        {/* Modal Chi tiết nhân viên */}
        <Modal
          title="Chi tiết thông tin nhân viên"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
              Đóng
            </Button>,
            <Button 
              key="edit" 
              type="primary" 
              onClick={() => {
                setIsDetailModalVisible(false);
                showEditModal(detailStaff);
              }}
            >
              Chỉnh sửa
            </Button>,
          ]}
          width={600}
        >
          {detailStaff && (
            <div>
              <p><strong>Tên đăng nhập:</strong> {detailStaff.username}</p>
              <p><strong>Họ và tên:</strong> {detailStaff.staffname || "Chưa cập nhật"}</p>
              <p><strong>Số điện thoại:</strong> {detailStaff.phone || "Chưa cập nhật"}</p>
              <p><strong>Giới tính:</strong> {
                detailStaff.gender === 'male' ? 'Nam' : 
                detailStaff.gender === 'female' ? 'Nữ' : 
                detailStaff.gender === 'other' ? 'Khác' : 'Chưa cập nhật'
              }</p>
              <p><strong>Vai trò:</strong> Nhân viên</p>
            </div>
          )}
        </Modal>

        {/* Modal Chỉnh sửa thông tin nhân viên */}
        <Modal
          title="Chỉnh sửa thông tin nhân viên"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form 
            form={editForm} 
            onFinish={handleUpdate} 
            layout="vertical"
            initialValues={editingStaff ? {
              staffname: editingStaff.staffname,
              phone: editingStaff.phone,
              gender: editingStaff.gender ? editingStaff.gender.charAt(0).toUpperCase() + editingStaff.gender.slice(1) : undefined,
            } : {}}
          >
            <Form.Item
              name="staffname"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                {
                  whitespace: true,
                  message: "Không được chỉ nhập khoảng trắng!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại phải có 10 chữ số!",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select>
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
                <Option value="Other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
                <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Thêm nhân viên mới */}
        <Modal
          title="Thêm nhân viên mới"
          open={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={createForm} onFinish={handleCreate} layout="vertical">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                {
                  whitespace: true,
                  message: "Không được chỉ nhập khoảng trắng!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="staffname"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                {
                  whitespace: true,
                  message: "Không được chỉ nhập khoảng trắng!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại phải có 10 chữ số!",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select>
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
                <Option value="Other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Thêm mới
                </Button>
                <Button onClick={() => setIsCreateModalVisible(false)}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default StaffsPage;
