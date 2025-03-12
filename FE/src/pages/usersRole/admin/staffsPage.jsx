import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Select, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../service/api";

const { Option } = Select;

const StaffsPage = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    const filtered = staffList.filter(
      (staff) =>
        staff.staffName?.toLowerCase().includes(searchText.toLowerCase()) ||
        staff.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredStaffs(filtered);
  }, [staffList, searchText]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
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
        // Kiểm tra cấu trúc dữ liệu trả về
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

      // Validate data before sending
      const staffData = {
        username: values.username?.trim(),
        password: values.password?.trim(),
        email: values.email?.trim(),
        staffName: values.staffName?.trim(),
        phone: values.phone?.trim(),
        address: values.address?.trim(),
        gender: values.gender,
        birthday: values.birthday?.trim(),
      };

      await axiosInstance.post("/staff/createStaff", staffData, {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      Modal.success({
        content: "Thêm nhân viên thành công!",
      });
      setIsCreateModalVisible(false);
      createForm.resetFields();
      fetchStaffs();
    } catch (error) {
      console.error("Error creating staff:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể thêm nhân viên",
      });
    }
  };

  const handleUpdate = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");

      // Validate data before sending
      const updatedData = {
        staffId: editingStaff._id,
        staffName: values.staffName?.trim(),
        phone: values.phone?.trim(),
        address: values.address?.trim(),
        gender: values.gender,
        birthday: values.birthday?.trim(),
        email: values.email?.trim(),
      };

      await axiosInstance.post("/staff/updateStaff", updatedData, {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      Modal.success({
        content: "Cập nhật thông tin nhân viên thành công!",
      });
      setIsEditModalVisible(false);
      fetchStaffs();
    } catch (error) {
      console.error("Error updating staff:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể cập nhật thông tin nhân viên",
      });
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

      Modal.success({
        content: "Xóa nhân viên thành công!",
      });

      await fetchStaffs(); // Refresh danh sách
    } catch (error) {
      console.error("Error deleting staff:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
        navigate("/login");
      } else {
        Modal.error({
          content: "Không thể xóa nhân viên",
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
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Họ và tên",
      dataIndex: "staffName",
      key: "staffName",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      key: "birthday",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text) => text || "Chưa cập nhật",
      ellipsis: true,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        const genderMap = {
          Male: "Nam",
          Female: "Nữ",
          Other: "Khác",
        };
        return genderMap[gender] || "Chưa cập nhật";
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <span>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Xóa nhân viên"
            description="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const showEditModal = (staff) => {
    setEditingStaff(staff);
    editForm.setFieldsValue({
      staffName: staff.staffName,
      email: staff.email,
      phone: staff.phone,
      address: staff.address,
      gender: staff.gender,
      birthday: staff.birthday,
    });
    setIsEditModalVisible(true);
  };

  return (
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

      <Input
        placeholder="Tìm kiếm theo tên, username hoặc email"
        allowClear
        onChange={handleSearch}
        style={{ width: 300, marginBottom: 16 }}
      />

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

      {/* Modal chỉnh sửa nhân viên */}
      <Modal
        title="Chỉnh sửa thông tin nhân viên"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="staffName"
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
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

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea maxLength={200} />
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

          <Form.Item
            name="birthday"
            label="Ngày sinh"
            rules={[
              {
                pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                message: "Định dạng ngày sinh không hợp lệ (DD/MM/YYYY)!",
              },
            ]}
          >
            <Input placeholder="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Cập nhật
            </Button>
            <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm nhân viên mới */}
      <Modal
        title="Thêm nhân viên mới"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Vui lòng nhập username!" },
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
            name="staffName"
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
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

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea maxLength={200} />
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

          <Form.Item
            name="birthday"
            label="Ngày sinh"
            rules={[
              {
                pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                message: "Định dạng ngày sinh không hợp lệ (DD/MM/YYYY)!",
              },
            ]}
          >
            <Input placeholder="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Thêm mới
            </Button>
            <Button onClick={() => setIsCreateModalVisible(false)}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffsPage;
