import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Popconfirm, DatePicker } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import axiosInstance from "../../../service/api";
const { Search } = Input;

const NewsManagement = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filteredNews, setFilteredNews] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        const filtered = news.filter(
            (news) =>
                news.newsTitle.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredNews(filtered);
    }, [news, searchText]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post("/news/showNews", {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
            });
            setNews(response.data);
            setFilteredNews(response.data);
        } catch (error) {
            console.error("Error fetching news:", error);
            Modal.error({
                content: "Failed to fetch news",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values) => {
        try {
            const createDate = values.createDate 
                ? values.createDate.format('YYYY-MM-DD') 
                : new Date().toISOString().split('T')[0];
            
            await axiosInstance.post("/news/createNews", 
                {
                    ...values,
                    userId: localStorage.getItem("userId") || "defaultUserId", // Use actual userId from localStorage
                    status: "active",
                    createDate: createDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            Modal.success({
                content: "Tạo News thành công",
            });

            setIsModalVisible(false);
            form.resetFields();
            fetchNews();
        } catch (error) {
            console.error("Error creating news:", error);
            Modal.error({
                content: "Failed to create news",
            });
        }
    };

    const handleUpdate = async (values) => {
        try {
            const updatedData = {
                newsTitle: values.newsTitle?.trim() || null,
                newsContent: values.newsContent?.trim() || null,
                status: editingNews.status,
            };
            await axiosInstance.post(
                `/news/update/${editingNews._id}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            Modal.success({
                content: "Cập nhập News thành công",
            });
            setIsEditModalVisible(false);
            fetchNews();
        } catch (error) {
            console.error("Error updating news:", error);
            Modal.error({
                content: "Failed to update news",
            });
        }
    };

    const handleDelete = async (newsId) => {
        try {
            await axiosInstance.post(
                `/news/delete/${newsId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            Modal.success({
                content: "Tạm xóa news thành công!",
            });

            fetchNews();
        } catch (error) {
            console.error("Error updating news status:", error);
            Modal.error({
                content: "Không thể cập nhật trạng thái news",
            });
        }
    };

    const handleRestore = async (newsId) => {
        try {
            await axiosInstance.post(
                `/news/restore/${newsId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            Modal.success({
                content: "Khôi phục news thành công!",
            });

            fetchNews();
        } catch (error) {
            console.error("Error restoring news:", error);
            Modal.error({
                content: "Không thể khôi phục news",
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
            title: "Title",
            dataIndex: "newsTitle",
            key: "newsTitle",
            render: (text) => text || "Chưa cập nhật",
        },
        {
            title: "Content",
            dataIndex: "newsContent",
            key: "newsContent",
            ellipsis: true,
            render: (text) => text || "Chưa cập nhật",
        },
        {
            title: "Ngày Tạo",
            dataIndex: "createDate",
            key: "createDate",
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
            title: "Trạng Thái",
            dataIndex: "status",
            key: "status",
            width: 100,
            render: (status) => (
                <span style={{ color: status === "active" ? "green" : "red" }}>
                    {status === "active" ? "Hoạt động" : "Tạm ẩn"}
                </span>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                    />
                    {record.status === "active" ? (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn tạm ẩn news này?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn khôi phục news này?"
                            onConfirm={() => handleRestore(record._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button type="primary" icon={<PlusOutlined />} />
                        </Popconfirm>
                    )}
                </div>
            ),
        }
    ];

    const showEditModal = (news) => {
        setEditingNews(news);
        editForm.setFieldsValue({
            newsTitle: news.newsTitle,
            newsContent: news.newsContent,
        });
        setIsEditModalVisible(true);
    };

    return (
        <div style={{ padding: "20px" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
            }}>
                <h2>News Management</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        form.resetFields();
                        setIsModalVisible(true);
                    }}
                >
                    Create New News
                </Button>
            </div>
            <Search
                placeholder="Search by title"
                allowClear
                enterButton
                onSearch={handleSearch}
                style={{ width: 300, marginBottom: 16 }}
            />
            <Table
                dataSource={filteredNews}
                columns={columns}
                loading={loading}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} news`,
                }}
            />

            {/* Create News Modal */}
            <Modal
                title="Create New News"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleCreate} layout="vertical">
                    <Form.Item
                        name="newsTitle"
                        label="Title"
                        rules={[{ required: true, message: "Title is required" }]}
                    >
                        <Input maxLength={200} />
                    </Form.Item>
                    <Form.Item
                        name="newsContent"
                        label="Content"
                        rules={[{ required: true, message: "Content is required" }]}
                    >   
                        <Input.TextArea rows={4} maxLength={1000} />
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
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                            Create
                        </Button>
                        <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                    </Form.Item>    
                </Form>
            </Modal>
            
            {/* Edit News Modal */}
            <Modal
                title="Edit News"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
            >
                <Form form={editForm} onFinish={handleUpdate} layout="vertical">
                    <Form.Item
                        name="newsTitle"
                        label="Title"
                        rules={[
                            { required: true, message: "Title is required" },
                            { whitespace: true, message: "Cannot contain only whitespace" }
                        ]}
                    >
                        <Input maxLength={200} />
                    </Form.Item>
                    <Form.Item
                        name="newsContent"
                        label="Content"
                        rules={[
                            { required: true, message: "Content is required" },
                            { whitespace: true, message: "Cannot contain only whitespace" }
                        ]}
                    >
                        <Input.TextArea rows={4} maxLength={1000} />
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

export default NewsManagement;
