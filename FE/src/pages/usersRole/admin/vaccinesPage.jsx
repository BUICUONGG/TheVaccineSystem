import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const VaccinesPage = () => {
  const navigate = useNavigate();
  const [vaccineList, setVaccineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchVaccines();
  }, []);

  useEffect(() => {
    const filtered = vaccineList.filter((vaccine) =>
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
      const response = await axios.get("http://localhost:8080/vaccines/showInfo");
      setVaccineList(response.data);
      setFilteredVaccines(response.data);
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      Modal.error({
        content: "Không thể tải danh sách vaccine",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      await axios.post("http://localhost:8080/vaccines/addVaccine", {
        ...values,
        status: "in stock"
      });
      
      Modal.success({
        content: "Thêm vaccine thành công!",
      });
      
      setIsModalVisible(false);
      form.resetFields();
      fetchVaccines();
    } catch (error) {
      console.error("Error creating vaccine:", error);
      Modal.error({
        content: "Không thể thêm vaccine",
      });
    }
  };

  const handleUpdate = async (values) => {
    try {
      const updatedData = {
        vaccineName: values.vaccineName?.trim() || null,
        price: values.price || 0,
        quantity: values.quantity || 0,
        mfgDate: values.mfgDate?.trim() || null,
        expDate: values.expDate?.trim() || null,
        status: editingVaccine.status
      };

      await axios.post(
        `http://localhost:8080/vaccines/updateVaccine/${editingVaccine._id}`,
        updatedData
      );

      Modal.success({
        content: "Cập nhật vaccine thành công!",
      });
      setIsEditModalVisible(false);
      fetchVaccines();
    } catch (error) {
      console.error("Error updating vaccine:", error);
      Modal.error({
        content: "Không thể cập nhật vaccine",
      });
    }
  };

  const handleDelete = async (vaccineId) => {
    try {
      await axios.post(`http://localhost:8080/vaccines/delete/${vaccineId}`);
      
      Modal.success({
        content: "Xóa vaccine thành công!",
      });
      
      fetchVaccines();
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      Modal.error({
        content: "Không thể xóa vaccine",
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
      title: "Tên Vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price?.toLocaleString()}đ`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "mfgDate",
      key: "mfgDate",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expDate",
      key: "expDate",
    },
    {
      title: "Trạng thái",
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
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Xóa vaccine"
            description="Bạn có chắc chắn muốn xóa vaccine này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const showEditModal = (vaccine) => {
    setEditingVaccine(vaccine);
    editForm.setFieldsValue({
      vaccineName: vaccine.vaccineName,
      price: vaccine.price,
      quantity: vaccine.quantity,
      mfgDate: vaccine.mfgDate,
      expDate: vaccine.expDate,
    });
    setIsEditModalVisible(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>Quản lý Vaccine</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm Vaccine Mới
        </Button>
      </div>

      <Search
        placeholder="Tìm kiếm theo tên vaccine"
        allowClear
        enterButton
        onSearch={handleSearch}
        style={{ width: 300, marginBottom: 16 }}
      />

      <Table
        dataSource={filteredVaccines}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} vaccine`,
        }}
      />

      <Modal
        title="Chỉnh sửa Vaccine"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="vaccineName"
            label="Tên Vaccine"
            rules={[
              { required: true, message: "Vui lòng nhập tên vaccine!" },
              { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" }
            ]}
          >
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[
              { required: true, message: "Vui lòng nhập giá!" },
              { type: 'number', min: 0, message: "Giá không được âm!" }
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng!" },
              { type: 'number', min: 0, message: "Số lượng không được âm!" }
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="mfgDate"
            label="Ngày sản xuất"
            rules={[
              { required: true, message: "Vui lòng nhập ngày sản xuất!" },
              { pattern: /^\d{2}\/\d{2}\/\d{4}$/, message: "Định dạng ngày không hợp lệ (DD/MM/YYYY)!" }
            ]}
          >
            <Input placeholder="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="expDate"
            label="Hạn sử dụng"
            rules={[
              { required: true, message: "Vui lòng nhập hạn sử dụng!" },
              { pattern: /^\d{2}\/\d{2}\/\d{4}$/, message: "Định dạng ngày không hợp lệ (DD/MM/YYYY)!" }
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

      <Modal
        title="Thêm Vaccine Mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="vaccineName"
            label="Tên Vaccine"
            rules={[{ required: true, message: "Vui lòng nhập tên vaccine!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="mfgDate"
            label="Ngày sản xuất"
            rules={[{ required: true, message: "Vui lòng nhập ngày sản xuất!" }]}
          >
            <Input placeholder="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="expDate"
            label="Hạn sử dụng"
            rules={[{ required: true, message: "Vui lòng nhập hạn sử dụng!" }]}
          >
            <Input placeholder="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinesPage;
