import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Select, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AllCustomerPage = () => {
  const navigate = useNavigate();
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customerList.filter((customer) =>
      customer.customerName?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [customerList, searchText]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const response = await axios.get(
        "http://localhost:8080/customer/getAllCustomer",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.data.result) {
        setCustomerList(response.data.result);
        setFilteredCustomers(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
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

  const handleUpdate = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      
      // Validate data before sending
      const updatedData = {
        customerName: values.customerName?.trim() || null,
        phone: values.phone?.trim() || null,
        address: values.address?.trim() || null,
        gender: values.gender || null,
        birthday: values.birthday?.trim() || null
      };

      await axios.post(
        `http://localhost:8080/customer/update/${editingCustomer.userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Cập nhật thông tin thành công!",
      });
      setIsEditModalVisible(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể cập nhật thông tin",
      });
    }
  };

  const handleDelete = async (userId) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");

      if (!accesstoken) {
        Modal.error({
          content: "Bạn cần đăng nhập lại",
        });
        return;
      }

      await axios.post(
        `http://localhost:8080/customer/delete/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Xóa khách hàng thành công!",
      });
      
      await fetchCustomers(); // Refresh danh sách
    } catch (error) {
      console.error("Error deleting customer:", error);
      if (error.response?.status === 401) {
        Modal.error({
          content: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
        navigate("/login");
      } else {
        Modal.error({
          content: "Không thể xóa thông tin khách hàng",
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
      title: "Họ và tên",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => text || "Chưa cập nhật"
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "Chưa cập nhật"
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      key: "birthday",
      render: (text) => text || "Chưa cập nhật"
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text) => text || "Chưa cập nhật"
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        const genderMap = {
          Male: "Nam",
          Female: "Nữ",
          Other: "Khác"
        };
        return genderMap[gender] || "Chưa cập nhật";
      }
    },
    
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <span>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ backgroundColor: "#52c41a", marginRight: 8 }}
            onClick={() => showEditModal(record)}
          >
            Cập nhật
          </Button>
        </span>
      ),
    },
  ];

  const showEditModal = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      customerName: customer.customerName,
      phone: customer.phone,
      address: customer.address,
      gender: customer.gender,
      birthday: customer.birthday,
    });
    setIsEditModalVisible(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customer Information Management</h2>
      <Input
        placeholder="Search by customer name"
        allowClear
        onChange={handleSearch}
        style={{ width: 300, marginBottom: 16 }}
      />
      <Table
        dataSource={filteredCustomers}
        columns={columns}
        loading={loading}
        rowKey="userId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} customers`,
        }}
      />

      <Modal
        title="Chỉnh sửa thông tin khách hàng"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="customerName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" }
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại phải có 10 chữ số!" }
            ]}
          >
            <Input maxLength={10} />
          </Form.Item>
          
          <Form.Item 
            name="address" 
            label="Địa chỉ"
          >
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
              { pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 
                message: "Định dạng ngày sinh không hợp lệ (DD/MM/YYYY)!" 
              }
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
    </div>
  );
};

export default AllCustomerPage;
