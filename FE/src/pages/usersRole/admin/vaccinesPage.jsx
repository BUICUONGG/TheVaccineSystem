import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, DatePicker, InputNumber } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const VaccinesPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [vaccineList, setVaccineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filteredVaccines, setFilteredVaccines] = useState([]);

  useEffect(() => {
    fetchVaccines();
  }, []);

  useEffect(() => {
    const filtered = vaccineList.filter(vaccine => 
      vaccine.vaccineName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredVaccines(filtered);
  }, [vaccineList, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/vaccine/listVaccine"
      );
      if (response.data.result) {
        setVaccineList(response.data.result);
        setFilteredVaccines(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      Modal.error({
        content: "Failed to fetch vaccines",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vaccineId) => {
    const accesstoken = localStorage.getItem("accesstoken");

    if (!accesstoken) {
      Modal.error({
        content: "You need to login first",
      });
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete this vaccine?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await axios.delete(
            `http://localhost:8080/vaccine/delete/${vaccineId}`,
            {
              headers: {
                Authorization: `Bearer ${accesstoken}`,
              },
            }
          );

          await fetchVaccines();
          Modal.success({
            content: "Vaccine deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting vaccine:", error);
          if (error.response?.status === 401) {
            Modal.error({
              content: "Unauthorized. Please login again.",
            });
            navigate("/login");
          } else {
            Modal.error({
              content: "Failed to delete vaccine",
            });
          }
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleAddVaccine = async (values) => {
    const accesstoken = localStorage.getItem("accesstoken");
    
    console.log("Starting handleAddVaccine with values:", values); // Debug log

    if (!accesstoken) {
      Modal.error({
        content: "You need to login first",
      });
      return;
    }

    try {
      const vaccineData = {
        vaccineName: values.vaccineName,
        price: Number(values.price),
        quantity: Number(values.quantity),
        mfgDate: values.mfgDate.format('DD/MM/YYYY'),
        expDate: values.expDate.format('DD/MM/YYYY'),
        status: "in stock"
      };

      console.log("Sending request to:", "http://localhost:8080/vaccine/addVaccine");
      console.log("With data:", vaccineData);
      console.log("Headers:", {
        Authorization: `Bearer ${accesstoken}`,
        'Content-Type': 'application/json',
      });

      const response = await axios.post(
        "http://localhost:8080/vaccine/addVaccine",
        vaccineData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Response received:", response.data);

      if (response.data.success) {
        Modal.success({
          content: "Vaccine added successfully",
        });
        setIsModalVisible(false);
        form.resetFields();
        await fetchVaccines();
      } else {
        throw new Error(response.data.message || "Failed to add vaccine");
      }
    } catch (error) {
      console.error("Error in handleAddVaccine:", error);
      Modal.error({
        content: error.response?.data?.message || "Failed to add vaccine",
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
      title: "Vaccine Name",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price.toLocaleString()}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Manufacturing Date",
      dataIndex: "mfgDate",
      key: "mfgDate",
      render: (date) => date
    },
    {
      title: "Expiration Date",
      dataIndex: "expDate",
      key: "expDate",
      render: (date) => date
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{
          color: status === "in stock" ? "#52c41a" : "#ff4d4f",
          textTransform: "capitalize"
        }}>
          {status}
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
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Vaccine Inventory Management</h2>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Add Vaccine
          </Button>
        </div>
      </div>
      
      <Search
        placeholder="Search vaccines..."
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />

      <Table
        columns={columns}
        dataSource={filteredVaccines}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} vaccines`,
        }}
      />

      <Modal
        title="Add New Vaccine"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddVaccine}
        >
          <Form.Item
            name="vaccineName"
            label="Vaccine Name"
            rules={[{ required: true, message: 'Please input vaccine name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: 'Please input price!' },
              { type: 'number', min: 0, message: 'Price must be greater than 0!' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              { required: true, message: 'Please input quantity!' },
              { type: 'number', min: 0, message: 'Quantity must be greater than or equal to 0!' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="mfgDate"
            label="Manufacturing Date"
            rules={[{ required: true, message: 'Please select manufacturing date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="expDate"
            label="Expiration Date"
            rules={[{ required: true, message: 'Please select expiration date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">Add</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinesPage; 
