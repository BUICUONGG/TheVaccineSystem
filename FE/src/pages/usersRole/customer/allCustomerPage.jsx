import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form } from "antd";
import { EditOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      const response = await axios.post(
        `http://localhost:8080/customer/update/${editingCustomer.userId}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.status === 200) {
        Modal.success({
          content: "Customer updated successfully",
        });
        setIsEditModalVisible(false);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      Modal.error({
        content: error.response?.data || "Failed to update customer",
      });
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
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },

    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      key: "birthday",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          style={{ backgroundColor: "#52c41a" }}
          onClick={() => showEditModal(record)}
        >
          Update
        </Button>
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
        title="Edit Customer Information"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[{ required: true, message: "Please input customer name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Please input phone number!" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender!" }]}
          >
            <select style={{ width: '100%', padding: '8px' }}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Form.Item>
          <Form.Item name="birthday" label="Birthday">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Update
            </Button>
            <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllCustomerPage;
