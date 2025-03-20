import { useState, useEffect } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Modal, 
  Form, 
  Popconfirm, 
  Tabs, 
  Tag, 
  Space,
  Tooltip,
  Badge
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  ExperimentOutlined,
  InboxOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
// import axios from "axios";
import axiosInstance from "../../../service/api.js";
// import { useNavigate } from "react-router-dom";

const { Search } = Input;

const VaccinesPage = () => {
  // const navigate = useNavigate();
  const [inventoryList, setInventoryList] = useState([]);
  const [importList, setImportList] = useState([]);
  const [packageList, setPackageList] = useState([]);
  const [loading, setLoading] = useState({
    inventory: false,
    imports: false,
    packages: false
  });
  const [searchText, setSearchText] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const filteredInv = inventoryList.filter((vaccine) =>
      vaccine.vaccineName?.toLowerCase().includes(searchText.toLowerCase()) ||
      vaccine.manufacturer?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredInventory(filteredInv);
    
    const filteredImp = importList.filter((imp) =>
      imp.batchNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      imp.supplier?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredImports(filteredImp);
    
    const filteredPkg = packageList.filter((pkg) =>
      pkg.packageName?.toLowerCase().includes(searchText.toLowerCase()) ||
      pkg.category?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPackages(filteredPkg);
  }, [inventoryList, importList, packageList, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const fetchAllData = async () => {
    const accesstoken = localStorage.getItem("accesstoken");
    if (!accesstoken) {
      Modal.error({ content: "Không có quyền truy cập. Vui lòng đăng nhập lại." });
      return;
    }
    
    await Promise.all([
      fetchInventory(accesstoken),
      fetchImports(accesstoken),
      fetchPackages(accesstoken)
    ]);
  };

  const fetchInventory = async (accesstoken) => {
    try {
      setLoading(prev => ({...prev, inventory: true}));
      const response = await axiosInstance.get("/vaccine/showInfo", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      
      setInventoryList(response.data || []);
      setFilteredInventory(response.data || []);
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      Modal.error({
        content: "Không thể tải danh sách vaccine",
      });
    } finally {
      setLoading(prev => ({...prev, inventory: false}));
    }
  };

  const fetchImports = async (accesstoken) => {
    try {
      setLoading(prev => ({...prev, imports: true}));
      const response = await axiosInstance.get("/vaccineImport/showInfo", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      
      setImportList(response.data || []);
      setFilteredImports(response.data || []);
    } catch (error) {
      console.error("Error fetching vaccine imports:", error);
      Modal.error({
        content: "Không thể tải danh sách nhập vaccine",
      });
    } finally {
      setLoading(prev => ({...prev, imports: false}));
    }
  };

  const fetchPackages = async (accesstoken) => {
    try {
      setLoading(prev => ({...prev, packages: true}));
      const response = await axiosInstance.get("/vaccinePackage/showInfo", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      
      setPackageList(response.data || []);
      setFilteredPackages(response.data || []);
    } catch (error) {
      console.error("Error fetching vaccine packages:", error);
      Modal.error({
        content: "Không thể tải danh sách gói vaccine",
      });
    } finally {
      setLoading(prev => ({...prev, packages: false}));
    }
  };

  const handleCreate = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      await axiosInstance.post(
        "/vaccine/addVaccine",
        {
          ...values,
          createdAt: new Date().toLocaleDateString("en-GB"),
        },
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Thêm vaccine thành công!",
      });

      setIsModalVisible(false);
      form.resetFields();
      fetchInventory(accesstoken);
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

      const accesstoken = localStorage.getItem("accesstoken");
      // Validate data before sending
      const updatedData = {
        vaccineName: values.vaccineName?.trim(),
        description: values.description?.trim(),
        manufacturer: values.manufacturer?.trim(),
        imageUrl: values.imageUrl?.trim(),
      };

      await axiosInstance.post(
        `/vaccine/updateVaccine/${editingVaccine._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Cập nhật vaccine thành công!",
      });
      setIsEditModalVisible(false);
      editForm.resetFields();
      fetchInventory(accesstoken);
    } catch (error) {
      console.error("Error updating vaccine:", error);
      Modal.error({
        content: error.message || "Không thể cập nhật vaccine",
      });
    }
  };

  const handleDelete = async (vaccineId) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      await axiosInstance.post(
        `/vaccine/delete/${vaccineId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Xóa vaccine thành công!",
      });

      fetchInventory(accesstoken);
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      Modal.error({
        content: "Không thể xóa vaccine",
      });
    }
  };

  const inventoryColumns = [
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
      sorter: (a, b) => a.vaccineName.localeCompare(b.vaccineName),
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
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => category ? <Tag color="blue">{category}</Tag> : <Tag color="default">Chưa phân loại</Tag>
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
      title: "Thông tin y tế",
      key: "information",
      render: (_, record) => {
        const info = record.information && record.information.length > 0 ? record.information[0] : null;
        if (!info) return <Tag color="orange">Chưa có thông tin</Tag>;
        
        return (
          <Tooltip title={
            <div>
              <div><strong>Phòng bệnh:</strong> {info.preventedDiseases || "N/A"}</div>
              <div><strong>Đối tượng:</strong> {info.eligibleGroups || "N/A"}</div>
              <div><strong>Đường dùng:</strong> {info.administrationRoute || "N/A"}</div>
            </div>
          }>
            <Button size="small">Xem thêm</Button>
          </Tooltip>
        );
      }
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
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
            <Button type="primary" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const importColumns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã lô",
      dataIndex: "batchNumber",
      key: "batchNumber",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Ngày nhập",
      dataIndex: "importDate",
      key: "importDate",
      sorter: (a, b) => new Date(a.importDate) - new Date(b.importDate),
    },
    {
      title: "Số loại vaccine",
      key: "vaccineCount",
      render: (_, record) => record.vaccines?.length || 0,
      sorter: (a, b) => (a.vaccines?.length || 0) - (b.vaccines?.length || 0),
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `${price?.toLocaleString() || 0} VNĐ`,
      sorter: (a, b) => (a.totalPrice || 0) - (b.totalPrice || 0),
    },
    {
      title: "Chi tiết",
      key: "details",
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => showImportDetailModal(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const packageColumns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên gói",
      dataIndex: "packageName",
      key: "packageName",
      sorter: (a, b) => a.packageName.localeCompare(b.packageName),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color="purple">{category || "Chưa phân loại"}</Tag>
      ),
    },
    {
      title: "Số loại vaccine",
      key: "vaccineCount",
      render: (_, record) => record.vaccines?.length || 0,
    },
    {
      title: "Số mũi tiêm",
      key: "scheduleCount",
      render: (_, record) => record.schedule?.length || 0,
    },
    {
      title: "Giá gói",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price?.toLocaleString() || 0} VNĐ`,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge 
          status={status === "active" ? "success" : "default"}
          text={status === "active" ? "Đang hoạt động" : "Không hoạt động"}
        />
      ),
    },
    {
      title: "Chi tiết",
      key: "details",
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => showPackageDetailModal(record)}
        >
          Xem chi tiết
        </Button>
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

    setEditingVaccine(vaccine);
    editForm.setFieldsValue({
      vaccineName: vaccine.vaccineName,
      description: vaccine.description,
      manufacturer: vaccine.manufacturer,
      imageUrl: vaccine.imageUrl,
      category: vaccine.category,
    });
    setIsEditModalVisible(true);
  };

  const showImportDetailModal = (importDetail) => {
    Modal.info({
      title: `Chi tiết lô nhập ${importDetail.batchNumber}`,
      width: 700,
      content: (
        <div>
          <p><strong>Nhà cung cấp:</strong> {importDetail.supplier}</p>
          <p><strong>Ngày nhập:</strong> {importDetail.importDate}</p>
          <p><strong>Tổng giá trị:</strong> {importDetail.totalPrice?.toLocaleString()} VNĐ</p>
          <Table
            dataSource={importDetail.vaccines}
            columns={[
              {
                title: "Vaccine",
                dataIndex: "vaccineId",
                key: "vaccineId",
                render: (vaccineId) => {
                  const vaccine = inventoryList.find(v => v._id === vaccineId);
                  return vaccine?.vaccineName || "N/A";
                }
              },
              {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
              },
              {
                title: "Hạn sử dụng",
                dataIndex: "expiryDate",
                key: "expiryDate",
              },
              {
                title: "Đơn giá",
                dataIndex: "unitPrice",
                key: "unitPrice",
                render: (price) => `${price?.toLocaleString() || 0} VNĐ`,
              }
            ]}
            pagination={false}
            rowKey={(record, index) => `vaccine-${index}`}
          />
        </div>
      ),
    });
  };

  const showPackageDetailModal = (packageDetail) => {
    Modal.info({
      title: `Chi tiết gói vaccine ${packageDetail.packageName}`,
      width: 700,
      content: (
        <div>
          <p><strong>Mô tả:</strong> {packageDetail.description}</p>
          <p><strong>Danh mục:</strong> {packageDetail.category}</p>
          <p><strong>Giá:</strong> {packageDetail.price?.toLocaleString()} VNĐ</p>
          <p><strong>Trạng thái:</strong> {packageDetail.status === "active" ? "Đang hoạt động" : "Không hoạt động"}</p>
          
          <h3>Danh sách vaccine trong gói</h3>
          <Table
            dataSource={packageDetail.vaccines}
            columns={[
              {
                title: "Vaccine",
                dataIndex: "vaccineId",
                key: "vaccineId",
                render: (vaccineId) => {
                  const vaccine = inventoryList.find(v => v._id === vaccineId);
                  return vaccine?.vaccineName || "N/A";
                }
              },
              {
                title: "Số liều",
                dataIndex: "quantity",
                key: "quantity",
              }
            ]}
            pagination={false}
            rowKey={(record, index) => `package-vaccine-${index}`}
          />
          
          <h3>Lịch tiêm</h3>
          <Table
            dataSource={packageDetail.schedule.map((day, index) => ({ 
              key: index,
              day,
              mui: index + 1
            }))}
            columns={[
              {
                title: "Mũi số",
                dataIndex: "mui",
                key: "mui",
              },
              {
                title: "Cách mũi đầu (ngày)",
                dataIndex: "day",
                key: "day",
                render: (day, record, index) => index === 0 ? "Mũi đầu tiên" : `${day} ngày`
              }
            ]}
            pagination={false}
          />
        </div>
      ),
    });
  };

  const getTabs = () => {
    return [
      {
        key: "inventory",
        label: (
          <span>
            <ExperimentOutlined /> Kho Vaccine
          </span>
        ),
        children: (
          <Table
            dataSource={filteredInventory}
            columns={inventoryColumns}
            loading={loading.inventory}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} vaccine`,
            }}
          />
        ),
      },
      {
        key: "imports",
        label: (
          <span>
            <InboxOutlined /> Nhập Vaccine
          </span>
        ),
        children: (
          <Table
            dataSource={filteredImports}
            columns={importColumns}
            loading={loading.imports}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} lô nhập`,
            }}
          />
        ),
      },
      {
        key: "packages",
        label: (
          <span>
            <ApartmentOutlined /> Gói Vaccine
          </span>
        ),
        children: (
          <Table
            dataSource={filteredPackages}
            columns={packageColumns}
            loading={loading.packages}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} gói vaccine`,
            }}
          />
        ),
      },
    ];
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

      <div style={{ marginBottom: 16 }}>
      <Search
          placeholder="Tìm kiếm"
        enterButton
        onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Tabs 
        defaultActiveKey="inventory" 
        items={getTabs()}
        onChange={(key) => setActiveTab(key)}
      />

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

          <Form.Item name="category" label="Danh mục">
            <Input />
          </Form.Item>

          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input />
          </Form.Item>

          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>

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

          <Form.Item name="category" label="Danh mục">
            <Input />
          </Form.Item>

          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input />
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

export default VaccinesPage;
