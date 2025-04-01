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
  Badge,
  DatePicker,
  InputNumber,
  Card,
  Select
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExperimentOutlined,
  InboxOutlined,     // Thêm icon cho tab Nhập Vaccine
  ApartmentOutlined
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
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isPackageModalVisible, setIsPackageModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [form] = Form.useForm();
  const [importForm] = Form.useForm();
  const [packageForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
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
  }, [importList, packageList, searchText]);

  useEffect(() => {

    // Lọc lại danh sách khi có cập nhật
    const filteredInv = inventoryList.filter((vaccine) =>
      vaccine.vaccineName?.toLowerCase().includes(searchText.toLowerCase()) ||
      vaccine.manufacturer?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredInventory(filteredInv);

  }, [inventoryList, searchText]);

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

  // Show info vaccine le 
  const fetchInventory = async (accesstoken) => {
    try {
      setLoading(prev => ({ ...prev, inventory: true }));
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
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  // Show info vaccine import
  const fetchImports = async (accesstoken) => {
    try {
      setLoading(prev => ({ ...prev, imports: true }));
      const response = await axiosInstance.get("/vaccineimport/getfullData", {
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
      setLoading(prev => ({ ...prev, imports: false }));
    }
  };

  // Show info vaccine package
  const fetchPackages = async (accesstoken) => {
    try {
      setLoading(prev => ({ ...prev, packages: true }));
      const response = await axiosInstance.get("/vaccinepakage/showVaccinePakage", {
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
      setLoading(prev => ({ ...prev, packages: false }));
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

      const updatedData = {
        vaccineName: values.vaccineName?.trim(),
        description: values.description?.trim(),
        manufacturer: values.manufacturer?.trim(),
        imageUrl: values.imageUrl?.trim(),
        category: values.category?.trim(),
        information: values.information ? [values.information] : undefined,
        createdAt: editingVaccine.createdAt
      };

      const response = await axiosInstance.post(
        `/vaccine/updateVaccine/${editingVaccine._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.status === 200) {
        // Tạo object vaccine mới
        const updatedVaccine = {
          ...editingVaccine,
          ...updatedData,
          _id: editingVaccine._id
        };

        // Cập nhật state và kích hoạt re-render
        setInventoryList(prevList => {
          const newList = prevList.map(vaccine =>
            vaccine._id === editingVaccine._id ? updatedVaccine : vaccine
          );
          setFilteredInventory(newList.filter(vaccine =>
            vaccine.vaccineName?.toLowerCase().includes(searchText.toLowerCase()) ||
            vaccine.manufacturer?.toLowerCase().includes(searchText.toLowerCase())
          ));
          return newList;
        });

        Modal.success({
          content: "Cập nhật vaccine thành công!",
        });

        setIsEditModalVisible(false);
        editForm.resetFields();
      }
    } catch (error) {
      console.error("Error updating vaccine:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể cập nhật vaccine",
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

  const handleCreateImport = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      const adminId = localStorage.getItem("userId");

      // Format lại ngày tháng trước khi gửi
      const formattedData = {
        batchNumber: values.batchNumber,
        vaccines: values.vaccines.map(v => ({
          vaccineId: v.vaccineId,
          quantity: parseInt(v.quantity),
          expiryDate: v.expiryDate.format("DD/MM/YYYY"), // Format ngày hết hạn
          unitPrice: parseFloat(v.unitPrice)
        })),
        importDate: values.importDate.format("DD/MM/YYYY"), // Format ngày nhập theo DD/MM/YYYY
        supplier: values.supplier,
        importedBy: adminId,
        totalPrice: values.vaccines.reduce((sum, v) => {
          return sum + (parseFloat(v.unitPrice) * parseInt(v.quantity));
        }, 0),
        createdAt: new Date().toLocaleDateString("en-GB") // Format ngày tạo theo DD/MM/YYYY
      };

      console.log("Payload gửi đi:", formattedData);

      await axiosInstance.post(
        "/vaccineimport/createvaccinceimport",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Thêm lô vaccine thành công!",
      });

      setIsImportModalVisible(false);
      importForm.resetFields();
      await fetchImports(accesstoken);
    } catch (error) {
      console.error("Error creating vaccine import:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể thêm lô vaccine",
      });
    }
  };

  const handleDeleteImport = async (importId) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      await axiosInstance.post(
        `/vaccineimport/deletevaccineimport/${importId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Xóa lô vaccine thành công!",
      });

      fetchImports(accesstoken);
    } catch (error) {
      console.error("Error deleting vaccine import:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể xóa lô vaccine",
      });
    }
  };

  const handleCreatePackage = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");

      const formattedData = {
        packageName: values.packageName,
        description: values.description,
        vaccines: values.vaccines.map(v => ({
          vaccineId: v.vaccineId,
          quantity: parseInt(v.quantity)
        })),
        schedule: values.schedule.map(s => parseInt(s.days)),
        price: parseFloat(values.price),
        category: values.category,
        status: "active",
        createdAt: new Date().toLocaleDateString("en-GB")
      };

      await axiosInstance.post(
        "/vaccinepakage/createVaccinePakage",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      Modal.success({
        content: "Thêm gói vaccine thành công!",
      });

      setIsPackageModalVisible(false);
      packageForm.resetFields();
      await fetchPackages(accesstoken);
    } catch (error) {
      console.error("Error creating vaccine package:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể thêm gói vaccine",
      });
    }
  };

  const handleDeletePackage = async (packageId) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      await axiosInstance.post(
        `/vaccinepakage/deleteVaccinePakage/${packageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );
  
      Modal.success({
        content: "Xóa gói vaccine thành công!",
      });
  
      fetchPackages(accesstoken);
    } catch (error) {
      console.error("Error deleting vaccine package:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể xóa gói vaccine",
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
            title="Xóa lô vaccine"
            description="Bạn có chắc chắn muốn xóa lô vaccine này?"
            onConfirm={() => handleDeleteImport(record._id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
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
            title="Xóa gói vaccine"
            description="Bạn có chắc chắn muốn xóa gói vaccine này?"
            onConfirm={() => handleDeletePackage(record._id)}
            okText="Có"
            cancelText="Không"
            okType="danger"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const showEditModal = (vaccine) => {
    setEditingVaccine(vaccine);

    // Reset form và set giá trị mới
    editForm.resetFields();
    editForm.setFieldsValue({
      vaccineName: vaccine.vaccineName,
      description: vaccine.description,
      manufacturer: vaccine.manufacturer,
      imageUrl: vaccine.imageUrl,
      category: vaccine.category,
      information: vaccine.information?.[0] || {}
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
            <InboxOutlined /> Nhập Lô Vaccine
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
        <Space>
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
          <Button
            type="primary"
            icon={<InboxOutlined />}
            onClick={() => {
              importForm.resetFields();
              setIsImportModalVisible(true);
            }}
          >
            Nhập Lô Vaccine
          </Button>
          <Button
            type="primary"
            icon={<ApartmentOutlined />}
            onClick={() => {
              packageForm.resetFields();
              setIsPackageModalVisible(true);
            }}
          >
            Tạo Gói Vaccine
          </Button>
        </Space>
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

      {/* Modal Thêm Vaccine Mới */}
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

      {/* Modal Nhập Lô Vaccine */}
      <Modal
        title="Thêm Lô Vaccine Mới"
        open={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={importForm} onFinish={handleCreateImport} layout="vertical">
          <Form.Item
            name="batchNumber"
            label="Mã lô"
            rules={[{ required: true, message: "Vui lòng nhập mã lô!" }]}
          >
            <Input />
          </Form.Item>

          <Form.List name="vaccines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    title={`Vaccine ${name + 1}`}
                    extra={<Button danger onClick={() => remove(name)}>Xóa</Button>}
                    style={{ marginBottom: 16 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "vaccineId"]}
                      label="Loại vaccine"
                      rules={[{ required: true, message: "Vui lòng chọn loại vaccine!" }]}
                    >
                      <Select placeholder="Chọn vaccine">
                        {inventoryList.map(vaccine => (
                          <Select.Option key={vaccine._id} value={vaccine._id}>
                            {vaccine.vaccineName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      label="Số lượng"
                      rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "expiryDate"]}
                      label="Ngày hết hạn"
                      rules={[{ required: true, message: "Vui lòng chọn ngày hết hạn!" }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "unitPrice"]}
                      label="Đơn giá"
                      rules={[{ required: true, message: "Vui lòng nhập đơn giá!" }]}
                    >
                      <InputNumber
                        min={0}
                        step={1000}
                        style={{ width: '100%' }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm vaccine
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item
            name="importDate"
            label="Ngày nhập"
            rules={[{ required: true, message: "Vui lòng chọn ngày nhập!" }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập nhà cung cấp!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Tạo lô vaccine
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tạo Gói Vaccine Mới"
        open={isPackageModalVisible}
        onCancel={() => setIsPackageModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={packageForm} onFinish={handleCreatePackage} layout="vertical">
          <Form.Item
            name="packageName"
            label="Tên gói vaccine"
            rules={[{ required: true, message: "Vui lòng nhập tên gói vaccine!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.List name="vaccines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    title={`Vaccine ${name + 1}`}
                    extra={<Button danger onClick={() => remove(name)}>Xóa</Button>}
                    style={{ marginBottom: 16 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "vaccineId"]}
                      label="Loại vaccine"
                      rules={[{ required: true, message: "Vui lòng chọn loại vaccine!" }]}
                    >
                      <Select placeholder="Chọn vaccine">
                        {inventoryList.map(vaccine => (
                          <Select.Option key={vaccine._id} value={vaccine._id}>
                            {vaccine.vaccineName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      label="Số mũi tiêm"
                      rules={[{ required: true, message: "Vui lòng nhập số mũi tiêm!" }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm vaccine
                </Button>
              </>
            )}
          </Form.List>

          <Form.List name="schedule" initialValue={[{ days: 0 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Form.Item
                    {...restField}
                    key={key}
                    label={name === 0 ? "Mũi đầu tiên" : `Mũi ${name + 1}`}
                  >
                    <Space>
                      {name === 0 ? (
                        <Form.Item
                          {...restField}
                          name={[name, "days"]}
                          noStyle
                        >
                          <InputNumber
                            disabled
                            value={0}
                            style={{ width: 200 }}
                          />
                        </Form.Item>
                      ) : (
                        <Form.Item
                          {...restField}
                          name={[name, "days"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số ngày!"
                            },
                            {
                              type: 'number',
                              min: 1,
                              message: "Số ngày phải lớn hơn 0!"
                            }
                          ]}
                          noStyle
                        >
                          <InputNumber
                            placeholder="Số ngày sau mũi đầu"
                            style={{ width: 200 }}
                            min={1}
                          />
                        </Form.Item>
                      )}
                      {name > 0 && (
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )}
                    </Space>
                    {name > 0 && (
                      <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                        Nhập số ngày cách so với mũi đầu tiên
                      </div>
                    )}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm mũi tiêm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="price"
            label="Giá gói"
            rules={[{ required: true, message: "Vui lòng nhập giá gói!" }]}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng nhập danh mục!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Tạo gói vaccine
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chỉnh sửa Vaccine */}
      <Modal
        title="Chỉnh sửa Vaccine"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="basic">
          <Tabs.TabPane tab="Thông tin cơ bản" key="basic">
            <Form form={editForm} onFinish={handleUpdate} layout="vertical">
              <Form.Item
                name="vaccineName"
                label="Tên Vaccine"
                rules={[
                  { required: true, message: "Vui lòng nhập tên vaccine!" },
                  { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
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
                  { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" },
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
                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                  Cập nhật
                </Button>
                <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Thông tin y tế" key="medical">
            <Form
              form={editForm}
              onFinish={handleUpdate}
              layout="vertical"
              initialValues={{
                information: editingVaccine?.information?.[0] || {}
              }}
            >
              <Form.Item
                name={["information", "preventedDiseases"]}
                label="Bệnh phòng ngừa"
                rules={[{ required: true, message: "Vui lòng nhập bệnh phòng ngừa!" }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                name={["information", "eligibleGroups"]}
                label="Đối tượng tiêm chủng"
                rules={[{ required: true, message: "Vui lòng nhập đối tượng tiêm chủng!" }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                name={["information", "administrationRoute"]}
                label="Đường dùng"
                rules={[{ required: true, message: "Vui lòng nhập đường dùng!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name={["information", "precautions"]}
                label="Lưu ý"
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name={["information", "reaction"]}
                label="Phản ứng có thể gặp"
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item className="text-right">
                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                  Cập nhật
                </Button>
                <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default VaccinesPage;
