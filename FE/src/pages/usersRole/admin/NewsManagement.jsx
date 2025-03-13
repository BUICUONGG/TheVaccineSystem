import { useState, useEffect } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Modal, 
  Form, 
  Popconfirm, 
  DatePicker, 
  Select, 
  Tag, 
  Upload, 
  message, 
  Tooltip,
  Space,
  Switch,
  Spin
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  UploadOutlined,
  UndoOutlined
} from "@ant-design/icons";
import moment from 'moment'; 
import axiosInstance from "../../../service/api";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const NewsManagement = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filteredNews, setFilteredNews] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [viewingNews, setViewingNews] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [imageUrl, setImageUrl] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filterStatus, setFilterStatus] = useState("all");

    // Category options
    const categoryOptions = [
        { value: 'uu-dai', label: 'Ưu đãi hấp dẫn' },
        { value: 'tin-tuc-suc-khoe', label: 'Tin tức sức khoẻ' },
        { value: 'hoat-dong', label: 'Hoạt động VNVC toàn quốc' },
        { value: 'khai-truong', label: 'Khai trương VNVC toàn quốc' },
        { value: 'livestream', label: 'Livestream tư vấn' },
        { value: 'tu-van', label: 'Tư vấn kiến thức sức khoẻ' },
        { value: 'cuoc-thi', label: 'Cuộc thi và sự kiện' },
        { value: 'doi-tac', label: 'Đối tác và hợp tác' },
        { value: 'general', label: 'Tin tức chung' }
    ];

    useEffect(() => {
        fetchNews();
    }, [pagination.current, pagination.pageSize, filterStatus]);

    useEffect(() => {
        if (searchText) {
            const filtered = news.filter(
                (item) =>
                    item.newsTitle.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.newsContent.toLowerCase().includes(searchText.toLowerCase()) ||
                    (item.categoryName && item.categoryName.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredNews(filtered);
        } else {
            setFilteredNews(news);
        }
    }, [news, searchText]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const fetchNews = async () => {
        try {
            setLoading(true);
            
            // Construct query parameters
            let url = `/news?page=${pagination.current}&limit=${pagination.pageSize}`;
            if (filterStatus !== "all") {
                url += `&status=${filterStatus}`;
            }
            
            const response = await axiosInstance.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
            });
            
            setNews(response.data.data);
            setFilteredNews(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.pagination.total
            });
        } catch (error) {
            console.error("Error fetching news:", error);
            message.error("Failed to fetch news");
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setPagination({
            ...pagination
        });
    };

    const handleStatusFilterChange = (value) => {
        setFilterStatus(value);
        setPagination({
            ...pagination,
            current: 1
        });
    };

    // Mock image upload function - replace with your actual upload logic
    const handleImageUpload = async (file) => {
        setUploadLoading(true);
        
        // In a real application, you would upload the file to your server or a cloud storage service
        // For this example, we'll just simulate an upload with a timeout
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create a FileReader to read the file as a data URL
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageUrl(reader.result);
                setUploadLoading(false);
                message.success("Image uploaded successfully");
            };
            
            return false; // Prevent default upload behavior
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error("Failed to upload image");
            setUploadLoading(false);
            return false;
        }
    };

    const handleCreate = async (values) => {
        try {
            const createDate = values.createDate 
                ? values.createDate.format('YYYY-MM-DD') 
                : new Date().toISOString().split('T')[0];
            
            // Process tags if provided
            const tags = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
            
            const newsData = {
                ...values,
                userId: localStorage.getItem("userId") || "defaultUserId",
                createDate: createDate,
                imageUrl: imageUrl,
                tags: tags,
                status: values.status || "draft"
            };
            
            await axiosInstance.post("/news/create", 
                newsData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            message.success("Tạo tin tức thành công");
            setIsModalVisible(false);
            form.resetFields();
            setImageUrl(null);
            fetchNews();
        } catch (error) {
            console.error("Error creating news:", error);
            message.error("Failed to create news: " + (error.response?.data?.error || error.message));
        }
    };

    const handleUpdate = async (values) => {
        try {
            // Process tags if provided
            const tags = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
            
            const updatedData = {
                ...values,
                tags: tags,
                imageUrl: imageUrl || editingNews.imageUrl
            };
            
            await axiosInstance.put(
                `/news/update/${editingNews._id}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            message.success("Cập nhật tin tức thành công");
            setIsEditModalVisible(false);
            fetchNews();
        } catch (error) {
            console.error("Error updating news:", error);
            message.error("Failed to update news: " + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (newsId) => {
        try {
            await axiosInstance.delete(
                `/news/delete/${newsId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            message.success("Xóa tin tức thành công");
            fetchNews();
        } catch (error) {
            console.error("Error deleting news:", error);
            message.error("Failed to delete news: " + (error.response?.data?.error || error.message));
        }
    };

    const handleArchive = async (newsId) => {
        try {
            await axiosInstance.put(
                `/news/archive/${newsId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            message.success("Lưu trữ tin tức thành công");
            fetchNews();
        } catch (error) {
            console.error("Error archiving news:", error);
            message.error("Failed to archive news: " + (error.response?.data?.error || error.message));
        }
    };

    const handleRestore = async (newsId) => {
        try {
            await axiosInstance.put(
                `/news/restore/${newsId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            message.success("Khôi phục tin tức thành công");
            fetchNews();
        } catch (error) {
            console.error("Error restoring news:", error);
            message.error("Failed to restore news: " + (error.response?.data?.error || error.message));
        }
    };

    const showEditModal = (news) => {
        setEditingNews(news);
        setImageUrl(news.imageUrl);
        
        editForm.setFieldsValue({
            newsTitle: news.newsTitle,
            newsContent: news.newsContent,
            summary: news.summary,
            category: news.category,
            tags: news.tags ? news.tags.join(', ') : '',
            status: news.status,
            featured: news.featured
        });
        
        setIsEditModalVisible(true);
    };

    const showViewModal = (news) => {
        setViewingNews(news);
        setIsViewModalVisible(true);
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'published':
                return <Tag color="green">Đã xuất bản</Tag>;
            case 'draft':
                return <Tag color="gold">Bản nháp</Tag>;
            case 'archived':
                return <Tag color="red">Đã lưu trữ</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    const columns = [
        {
            title: "STT",
            key: "stt",
            render: (_, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
            width: 70,
        },
        {
            title: "Tiêu đề",
            dataIndex: "newsTitle",
            key: "newsTitle",
            ellipsis: true,
            render: (text) => text || "Chưa cập nhật",
        },
        {
            title: "Danh mục",
            dataIndex: "categoryName",
            key: "categoryName",
            width: 180,
            render: (text) => text || "Chưa phân loại",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createDate",
            key: "createDate",
            width: 120,
            render: (text) => {
                if (!text) return "Chưa cập nhật";
                try {
                    const date = new Date(text);
                    if (isNaN(date.getTime())) return "Ngày không hợp lệ";
                    return date.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } catch (error) {
                    console.error("Error formatting date:", error);
                    return "Lỗi định dạng ngày";
                }
            },
        },
        {
            title: "Lượt xem",
            dataIndex: "viewCount",
            key: "viewCount",
            width: 100,
            render: (count) => count || 0,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => getStatusTag(status),
        },
        {
            title: "Nổi bật",
            dataIndex: "featured",
            key: "featured",
            width: 100,
            render: (featured) => featured ? <Tag color="blue">Nổi bật</Tag> : "Thường",
        },
        {
            title: "Hành động",
            key: "action",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => showViewModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                    {record.status === "published" ? (
                        <Tooltip title="Lưu trữ">
                            <Popconfirm
                                title="Bạn có chắc chắn muốn lưu trữ tin tức này?"
                                onConfirm={() => handleArchive(record._id)}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    ) : record.status === "archived" ? (
                        <Tooltip title="Khôi phục">
                            <Popconfirm
                                title="Bạn có chắc chắn muốn khôi phục tin tức này?"
                                onConfirm={() => handleRestore(record._id)}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button type="primary" icon={<UndoOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Xóa">
                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa tin tức này?"
                                onConfirm={() => handleDelete(record._id)}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            ),
        }
    ];

    return (
        <div style={{ padding: "20px" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px"
            }}>
                <h2>Quản lý tin tức</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        form.resetFields();
                        setImageUrl(null);
                        setIsModalVisible(true);
                    }}
                >
                    Tạo tin tức mới
                </Button>
            </div>
            
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px"
            }}>
                <Search
                    placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc danh mục"
                    allowClear
                    enterButton
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                
                <Select
                    defaultValue="all"
                    style={{ width: 150 }}
                    onChange={handleStatusFilterChange}
                >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="published">Đã xuất bản</Option>
                    <Option value="draft">Bản nháp</Option>
                    <Option value="archived">Đã lưu trữ</Option>
                </Select>
            </div>
            
            <Table
                dataSource={filteredNews}
                columns={columns}
                loading={loading}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} tin tức`,
                }}
                onChange={handleTableChange}
            />

            {/* Create News Modal */}
            <Modal
                title="Tạo tin tức mới"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} onFinish={handleCreate} layout="vertical">
                    <Form.Item
                        name="newsTitle"
                        label="Tiêu đề"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                    >
                        <Input maxLength={200} />
                    </Form.Item>
                    
                    <Form.Item
                        name="summary"
                        label="Tóm tắt"
                        rules={[{ max: 500, message: "Tóm tắt không quá 500 ký tự" }]}
                    >
                        <TextArea rows={3} maxLength={500} />
                    </Form.Item>
                    
                    <Form.Item
                        name="newsContent"
                        label="Nội dung"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                    >
                        <TextArea rows={8} maxLength={5000} />
                    </Form.Item>
                    
                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {categoryOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item
                        name="tags"
                        label="Tags (phân cách bằng dấu phẩy)"
                    >
                        <Input placeholder="tag1, tag2, tag3" />
                    </Form.Item>
                    
                    <Form.Item
                        label="Hình ảnh"
                    >
                        <Upload
                            name="image"
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={handleImageUpload}
                            disabled={uploadLoading}
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="Uploaded" style={{ width: '100%' }} />
                            ) : (
                                <div>
                                    {uploadLoading ? <Spin /> : <UploadOutlined />}
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item
                        name="createDate"
                        label="Ngày tạo"
                        help="Nếu không chọn, hệ thống sẽ tự động sử dụng ngày hiện tại"
                    >
                        <DatePicker 
                            format="DD/MM/YYYY" 
                            placeholder="Chọn ngày tạo"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    
                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        initialValue="draft"
                    >
                        <Select>
                            <Option value="published">Xuất bản</Option>
                            <Option value="draft">Lưu nháp</Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item
                        name="featured"
                        label="Tin nổi bật"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch />
                    </Form.Item>
                    
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                            Tạo tin tức
                        </Button>
                        <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                    </Form.Item>    
                </Form>
            </Modal>
            
            {/* Edit News Modal */}
            <Modal
                title="Chỉnh sửa tin tức"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={editForm} onFinish={handleUpdate} layout="vertical">
                    <Form.Item
                        name="newsTitle"
                        label="Tiêu đề"
                        rules={[
                            { required: true, message: "Vui lòng nhập tiêu đề" },
                            { whitespace: true, message: "Không được chỉ chứa khoảng trắng" }
                        ]}
                    >
                        <Input maxLength={200} />
                    </Form.Item>
                    
                    <Form.Item
                        name="summary"
                        label="Tóm tắt"
                        rules={[{ max: 500, message: "Tóm tắt không quá 500 ký tự" }]}
                    >
                        <TextArea rows={3} maxLength={500} />
                    </Form.Item>
                    
                    <Form.Item
                        name="newsContent"
                        label="Nội dung"
                        rules={[
                            { required: true, message: "Vui lòng nhập nội dung" },
                            { whitespace: true, message: "Không được chỉ chứa khoảng trắng" }
                        ]}
                    >
                        <TextArea rows={8} maxLength={5000} />
                    </Form.Item>
                    
                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {categoryOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item
                        name="tags"
                        label="Tags (phân cách bằng dấu phẩy)"
                    >
                        <Input placeholder="tag1, tag2, tag3" />
                    </Form.Item>
                    
                    <Form.Item
                        label="Hình ảnh"
                    >
                        <Upload
                            name="image"
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={handleImageUpload}
                            disabled={uploadLoading}
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="Uploaded" style={{ width: '100%' }} />
                            ) : (
                                <div>
                                    {uploadLoading ? <Spin /> : <UploadOutlined />}
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item
                        name="status"
                        label="Trạng thái"
                    >
                        <Select>
                            <Option value="published">Xuất bản</Option>
                            <Option value="draft">Lưu nháp</Option>
                            <Option value="archived">Lưu trữ</Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item
                        name="featured"
                        label="Tin nổi bật"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                            Cập nhật
                        </Button>
                        <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
                    </Form.Item>
                </Form>
            </Modal>
            
            {/* View News Modal */}
            <Modal
                title="Chi tiết tin tức"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>,
                    <Button 
                        key="edit" 
                        type="primary" 
                        onClick={() => {
                            setIsViewModalVisible(false);
                            showEditModal(viewingNews);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                ]}
                width={800}
            >
                {viewingNews && (
                    <div className="news-view-container">
                        <h2>{viewingNews.newsTitle}</h2>
                        
                        <div className="news-view-meta">
                            <p><strong>Danh mục:</strong> {viewingNews.categoryName}</p>
                            <p><strong>Ngày tạo:</strong> {new Date(viewingNews.createDate).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Trạng thái:</strong> {getStatusTag(viewingNews.status)}</p>
                            <p><strong>Lượt xem:</strong> {viewingNews.viewCount || 0}</p>
                            <p><strong>Nổi bật:</strong> {viewingNews.featured ? "Có" : "Không"}</p>
                        </div>
                        
                        {viewingNews.summary && (
                            <div className="news-view-summary">
                                <h3>Tóm tắt:</h3>
                                <p>{viewingNews.summary}</p>
                            </div>
                        )}
                        
                        {viewingNews.imageUrl && (
                            <div className="news-view-image">
                                <h3>Hình ảnh:</h3>
                                <img src={viewingNews.imageUrl} alt={viewingNews.newsTitle} style={{ maxWidth: '100%' }} />
                            </div>
                        )}
                        
                        <div className="news-view-content">
                            <h3>Nội dung:</h3>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{viewingNews.newsContent}</div>
                        </div>
                        
                        {viewingNews.tags && viewingNews.tags.length > 0 && (
                            <div className="news-view-tags">
                                <h3>Tags:</h3>
                                {viewingNews.tags.map(tag => (
                                    <Tag key={tag} color="blue">{tag}</Tag>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NewsManagement;
