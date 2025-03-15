import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
// import axios from "axios";
import axiosInstance from "../../../service/api.js";
// import { useNavigate } from "react-router-dom";

const { Search } = Input;

const VaccinesPage = () => {
  // const navigate = useNavigate();
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
    const accesstoken = localStorage.getItem("accessToken");
    try {
      setLoading(true);
      const response = await axiosInstance.get("/vaccine/showInfo", {
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      setVaccineList(response.data);
      setFilteredVaccines(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      Modal.error({
        content: "Không thể tải danh sách vaccine",
      });
    }
  };

  const handleCreate = async (values) => {
    try {
      await axiosInstance.post(
        "/vaccine/addVaccine",
        {
          ...values,
          createdAt: new Date().toLocaleDateString("en-GB"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

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
      if (!editingVaccine?._id) {
        throw new Error("Không tìm thấy ID vaccine");
      }

      // Chuyển đổi price thành số
      const price = Number(values.price);
      
      // Kiểm tra giá trị price
      if (isNaN(price) || price < 0) {
        throw new Error("Giá không hợp lệ hoặc âm");
      }

      // Validate data before sending
      const updatedData = {
        vaccineName: values.vaccineName?.trim(),
        description: values.description?.trim(),
        manufacturer: values.manufacturer?.trim(),
        imageUrl: values.imageUrl?.trim(),
        price: price, // Đảm bảo là số
      };

      await axiosInstance.post(
        `/vaccine/updateVaccine/${editingVaccine._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Cập nhật vaccine thành công!",
      });
      setIsEditModalVisible(false);
      editForm.resetFields();
      fetchVaccines();
    } catch (error) {
      console.error("Error updating vaccine:", error);
      Modal.error({
        content: error.message || "Không thể cập nhật vaccine",
      });
    }
  };

  const handleDelete = async (vaccineId) => {
    try {
      await axiosInstance.post(
        `/vaccine/delete/${vaccineId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

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
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Nhà sản xuất",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
    {
      title: "Giá",
      key: "price",
      render: (_, record) => {
        if (record.vaccineImports && 
            record.vaccineImports.length > 0 && 
            record.vaccineImports[0].price) {
          return `${record.vaccineImports[0].price.toLocaleString()} VNĐ`;
        }
        return "Chưa có giá";
      },
      sorter: (a, b) => {
        const priceA = a.vaccineImports && a.vaccineImports.length > 0 && a.vaccineImports[0].price ? a.vaccineImports[0].price : 0;
        const priceB = b.vaccineImports && b.vaccineImports.length > 0 && b.vaccineImports[0].price ? b.vaccineImports[0].price : 0;
        return priceA - priceB;
      },
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) =>
        imageUrl ? (
          <img
            src={imageUrl}
            alt="Vaccine"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "Chưa có hình ảnh"
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
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
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const showEditModal = (vaccine) => {
    if (!vaccine?._id) {
      Modal.error({
        content: "Không tìm thấy thông tin vaccine",
      });
      return;
    }

    // Lấy giá từ vaccineImports và đảm bảo là số
    let price = 0;
    if (vaccine.vaccineImports && vaccine.vaccineImports.length > 0) {
      price = Number(vaccine.vaccineImports[0].price);
    }

    setEditingVaccine(vaccine);
    editForm.setFieldsValue({
      vaccineName: vaccine.vaccineName,
      description: vaccine.description,
      manufacturer: vaccine.manufacturer,
      imageUrl: vaccine.imageUrl,
      price: price, // Đảm bảo là số
    });
    setIsEditModalVisible(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
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
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="vaccineName"
            label="Tên Vaccine"
            rules={[
              { required: true, message: "Vui lòng nhập tên vaccine!" },
              {
                whitespace: true,
                message: "Không được chỉ nhập khoảng trắng!",
              },
            ]}
          >
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} maxLength={1000} />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="Nhà sản xuất"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhà sản xuất!" },
              {
                whitespace: true,
                message: "Không được chỉ nhập khoảng trắng!",
              },
            ]}
          >
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập giá!" },
            ]}
          >
            <Input 
              type="number" 
              min={0} 
              step={1000}
              onChange={(e) => {
                // Đảm bảo giá trị là số dương
                const value = e.target.value;
                if (value < 0) {
                  editForm.setFieldsValue({ price: 0 });
                }
              }}
            />
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
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} maxLength={1000} />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="Nhà sản xuất"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhà sản xuất!" },
            ]}
          >
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập giá!" },
              { type: 'number', min: 0, message: "Giá không được âm!" }
            ]}
          >
            <Input type="number" min={0} />
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
