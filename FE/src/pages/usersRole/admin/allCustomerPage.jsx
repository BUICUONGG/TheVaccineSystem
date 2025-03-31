import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Select, Popconfirm, Tag, Space, Typography, Tooltip } from "antd";
import { EditOutlined, EyeOutlined, EyeInvisibleOutlined, SearchOutlined, InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import axiosInstance from "../../../service/api";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const AllCustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = customers.filter(
        (item) =>
          item.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchText]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/customer/getAllCustomer", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      const customersData = response.data.result || [];
      console.log("Customer data returned:", customersData);
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      setTotalCustomers(customersData.length);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      Modal.error({
        content: "Không thể tải danh sách khách hàng",
      });
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
  };

  const handleUpdate = async (values) => {
    try {
      console.log("Customer being edited:", editingCustomer);
      
      const updatedData = {
        customerName: values.customerName?.trim() || null,
        phone: values.phone?.trim() || null,
        birthday: values.birthday?.trim() || null,
        address: values.address?.trim() || null,
        gender: values.gender || null,
      };

      await axiosInstance.post(
        `/customer/update/${editingCustomer._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Cập nhật thông tin khách hàng thành công!",
      });
      setIsEditModalVisible(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể cập nhật thông tin khách hàng",
      });
    }
  };

  const handleHideCustomer = async (customerId) => {
    try {
      console.log("Hiding customer with ID:", customerId);
      
      // We won't actually delete the customer, just hide it by setting fields to null
      await axiosInstance.post(
        `/customer/update/${customerId}`,
        {
          customerName: null,
          phone: null,
          birthday: null,
          address: null,
          gender: null
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Ẩn thông tin khách hàng thành công!",
      });

      fetchCustomers();
    } catch (error) {
      console.error("Error hiding customer:", error);
      Modal.error({
        content: "Không thể ẩn thông tin khách hàng",
      });
    }
  };

  const showDetailModal = (customer) => {
    setDetailCustomer(customer);
    setIsDetailModalVisible(true);
  };

  const showEditModal = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      customerName: customer.customerName,
      phone: customer.phone,
      birthday: customer.birthday,
      address: customer.address,
      gender: customer.gender,
    });
    setIsEditModalVisible(true);
  };

  const getGenderDisplay = (gender) => {
    const genderMap = {
      Male: "Nam",
      Female: "Nữ",
      Other: "Khác"
    };
    return genderMap[gender] || "Chưa cập nhật";
  };

  const isCustomerHidden = (customer) => {
    return !customer.customerName && !customer.phone && !customer.birthday && !customer.address && !customer.gender;
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Họ và tên",
      dataIndex: "customerName",
      key: "customerName",
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
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        let color = 'default';
        if (gender === 'Male') color = 'blue';
        if (gender === 'Female') color = 'pink';
        
        return (
          <Tag color={color}>
            {getGenderDisplay(gender)}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={isCustomerHidden(record) ? "error" : "success"}>
          {isCustomerHidden(record) ? "Đã ẩn" : "Hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          {!isCustomerHidden(record) ? (
            <Tooltip title="Ẩn thông tin">
              <Popconfirm
                title="Ẩn thông tin khách hàng?"
                description="Bạn có chắc chắn muốn ẩn thông tin của khách hàng này?"
                onConfirm={() => handleHideCustomer(record._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button danger icon={<EyeInvisibleOutlined />} />
              </Popconfirm>
            </Tooltip>
          ) : (
            <Tooltip title="Không thể khôi phục">
              <Button disabled icon={<EyeInvisibleOutlined />} />
            </Tooltip>
          )}
        </Space>
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
        <h2>Quản lý Khách hàng</h2>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tên hoặc số điện thoại"
          value={searchText}
          onChange={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        
        <Button onClick={fetchCustomers} icon={<ReloadOutlined />} type="default">
          Làm mới dữ liệu
        </Button>
      </div>

      <Table
        dataSource={filteredCustomers}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCustomers,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} khách hàng`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      {/* Modal Chi tiết khách hàng */}
      <Modal
        title="Chi tiết thông tin khách hàng"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setIsDetailModalVisible(false);
            showEditModal(detailCustomer);
          }}>
            Chỉnh sửa
          </Button>
        ]}
        width={600}
      >
        {detailCustomer && (
          <div>
            <p><strong>Tên đăng nhập:</strong> {detailCustomer.username || "Chưa cập nhật"}</p>
            <p><strong>Họ và tên:</strong> {detailCustomer.customerName || "Chưa cập nhật"}</p>
            <p><strong>Số điện thoại:</strong> {detailCustomer.phone || "Chưa cập nhật"}</p>
            <p><strong>Ngày sinh:</strong> {detailCustomer.birthday || "Chưa cập nhật"}</p>
            <p><strong>Địa chỉ:</strong> {detailCustomer.address || "Chưa cập nhật"}</p>
            <p><strong>Giới tính:</strong> {getGenderDisplay(detailCustomer.gender)}</p>
            <p><strong>Trạng thái:</strong> {isCustomerHidden(detailCustomer) ? "Đã ẩn" : "Hoạt động"}</p>
          </div>
        )}
      </Modal>

      {/* Modal Chỉnh sửa khách hàng */}
      <Modal
        title="Chỉnh sửa thông tin khách hàng"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="customerName"
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
            name="birthday"
            label="Ngày sinh"
          >
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={3} maxLength={300} />
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
    </div>
  );
};

export default AllCustomerPage;
