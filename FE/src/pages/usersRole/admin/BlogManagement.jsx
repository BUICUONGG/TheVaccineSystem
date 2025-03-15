import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Popconfirm, Select, Tag, Rate, Typography, Space, Tooltip, Divider, Badge, Card } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, FilterOutlined, EyeOutlined, ClockCircleOutlined, LikeOutlined, CommentOutlined, InfoCircleOutlined, StarOutlined } from "@ant-design/icons";
import axiosInstance from "../../../service/api";

const { Option } = Select;
const { Text, Paragraph } = Typography;

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isStatsModalVisible, setIsStatsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [detailBlog, setDetailBlog] = useState(null);
  const [statsBlog, setStatsBlog] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [form] = Form.useForm();

  const categories = [
    { value: "lich-tiem-chung", label: "Lịch tiêm chủng" },
    { value: "hoat-dong-tiem-chung", label: "Hoạt động tiêm chủng" },
    { value: "quy-trinh-tiem-chung", label: "Quy trình tiêm chủng" },
    { value: "nhung-dieu-can-biet-truoc-khi-tiem", label: "Những điều cần biết trước khi tiêm" },
    { value: "nhung-dieu-can-biet-sau-khi-tiem", label: "Những điều cần biết sau khi tiêm" },
    { value: "khac", label: "Khác" }
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = blogs;
    
    // Lọc theo danh mục
    if (categoryFilter) {
      filtered = filtered.filter(blog => blog.category === categoryFilter);
    }
    
    // Lọc theo trạng thái
    if (statusFilter) {
      filtered = filtered.filter(blog => blog.status === statusFilter);
    }
    
    setFilteredBlogs(filtered);
  }, [blogs, categoryFilter, statusFilter]);

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/blogs/showBlog", {
        params: {
          includeDeleted: true  // Thêm tham số để lấy cả bài viết đã ẩn
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      // Hiển thị tất cả các blog, bao gồm cả những blog có trạng thái "none" và "active"
      const blogsData = response.data.blogs || response.data;
      console.log("Fetched blogs:", blogsData); // Log để kiểm tra dữ liệu
      setBlogs(blogsData);
      setFilteredBlogs(blogsData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      Modal.error({
        content: "Không thể tải danh sách blog",
      });
    }
  };

  const handleCreate = async (values) => {
    try {
      let tags = [];
      if (values.tags) {
        tags = values.tags.split(',').map(tag => tag.trim());
      }

      await axiosInstance.post(
        "/blogs/createBlog",
        {
          ...values,
          tags,
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Tạo bài viết thành công",
      });

      setIsModalVisible(false);
      form.resetFields();
      fetchBlogs(); 
    } catch (error) {
      console.error("Error creating blog:", error);
      Modal.error({
        content: "Failed to create blog",
      });
    }
  };

  const handleUpdate = async (values) => {
    try {
      // Xử lý tags nếu có
      let tags = editingBlog.tags || [];
      if (values.tags) {
        tags = values.tags.split(',').map(tag => tag.trim());
      }

      const updatedData = {
        blogTitle: values.blogTitle?.trim() || null,
        blogContent: values.blogContent?.trim() || null,
        author: values.author?.trim() || null,
        category: values.category || editingBlog.category,
        tags,
        status: editingBlog.status,
        thumbnail: values.thumbnail || editingBlog.thumbnail,
      };

      await axiosInstance.post(
        `/blogs/update/${editingBlog._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Cập nhật blog thành công!",
      });
      setIsEditModalVisible(false);
      fetchBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
      Modal.error({
        content: error.response?.data?.message || "Không thể cập nhật blog",
      });
    }
  };

  const handleDelete = async (blogId) => {
    try {
      await axiosInstance.post(
        `/blogs/delete/${blogId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Tạm xóa blog thành công!",
      });

      fetchBlogs();
    } catch (error) {
      console.error("Error updating blog status:", error);
      Modal.error({
        content: "Không thể cập nhật trạng thái blog",
      });
    }
  };

  const handleRestore = async (blogId) => {
    try {
      await axiosInstance.post(
        `/blogs/restore/${blogId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Khôi phục blog thành công!",
      });

      fetchBlogs();
    } catch (error) {
      console.error("Error restoring blog:", error);
      Modal.error({
        content: "Không thể khôi phục blog",
      });
    }
  };

  // Hàm lấy tên hiển thị của danh mục từ giá trị
  const getCategoryLabel = (value) => {
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  const showDetailModal = (blog) => {
    setDetailBlog(blog);
    setIsDetailModalVisible(true);
  };

  const showStatsModal = (blog) => {
    setStatsBlog(blog);
    setIsStatsModalVisible(true);
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 60,
    },
    {
      title: "Title",
      dataIndex: "blogTitle",
      key: "blogTitle",
      render: (text) => text || "Chưa cập nhật",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Content",
      dataIndex: "blogContent",
      key: "blogContent",
      ellipsis: true,
      width: 250,
      render: (text, record) => (
        <Space direction="vertical">
          <Paragraph ellipsis={{ rows: 2 }}>
            {text || "Chưa cập nhật"}
          </Paragraph>
          {/* <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => showDetailModal(record)}
          >
            Xem chi tiết
          </Button> */}
        </Space>
      ),
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      render: (text) => text || "Chưa cập nhật",
      width: 120,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => (
        <Tag color="blue">{getCategoryLabel(category) || "Chưa phân loại"}</Tag>
      ),
    },
    
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Badge 
          status={status === "active" ? "success" : "error"} 
          text={status === "active" ? "Hoạt động" : "Tạm ẩn"}
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          {record.status === "active" ? (
            <Popconfirm
              title="Bạn có chắc chắn muốn tạm ẩn blog này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có chắc chắn muốn khôi phục blog này?"
              onConfirm={() => handleRestore(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" icon={<PlusOutlined />} />
            </Popconfirm>
          )}
        </div>
      ),
    },
    {
      title: "Chi tiết",
      key: "details",
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<InfoCircleOutlined />} 
          onClick={() => showStatsModal(record)}
        ></Button>
      ),
    },
  ];

  const showEditModal = (blog) => {
    setEditingBlog(blog);
    form.setFieldsValue({
      blogTitle: blog.blogTitle,
      blogContent: blog.blogContent,
      author: blog.author,
      category: blog.category,
      tags: blog.tags ? blog.tags.join(', ') : '',
      thumbnail: blog.thumbnail,
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
        <h2>Blog Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Create New Blog
        </Button>
      </div>

      <div style={{ marginBottom: "16px", display: "flex", gap: "16px" }}>
        <Select
          placeholder="Lọc theo danh mục"
          style={{ width: 250 }}
          onChange={handleCategoryFilter}
          allowClear
          suffixIcon={<FilterOutlined />}
        >
          {categories.map(category => (
            <Option key={category.value} value={category.value}>
              {category.label}
            </Option>
          ))}
        </Select>
        
        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          onChange={handleStatusFilter}
          allowClear
          suffixIcon={<FilterOutlined />}
        >
          <Option value="active">Hoạt động</Option>
          <Option value="none">Tạm ẩn</Option>
        </Select>
      </div>

      <Table
        dataSource={filteredBlogs}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} blogs`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modal Chi tiết thống kê */}
      <Modal
        title="Chi tiết thống kê"
        open={isStatsModalVisible}
        onCancel={() => setIsStatsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsStatsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {statsBlog && (
          <div>
            <h3>{statsBlog.blogTitle}</h3>
            <Divider />
            
            <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
              <p><strong>Tác giả:</strong> {statsBlog.author}</p>
              <p><strong>Danh mục:</strong> {getCategoryLabel(statsBlog.category)}</p>
              <p><strong>Ngày tạo:</strong> {new Date(statsBlog.createDate).toLocaleString()}</p>
              <p><strong>Trạng thái:</strong> {statsBlog.status === "active" ? "Hoạt động" : "Tạm ẩn"}</p>
            </Card>
            
            <Card title="Thống kê tương tác" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p><EyeOutlined /> Lượt xem: <strong>{statsBlog.views || 0}</strong></p>
                  <p><LikeOutlined /> Lượt thích: <strong>{statsBlog.likes || 0}</strong></p>
                </div>
                <div>
                  <p><CommentOutlined /> Bình luận: <strong>{statsBlog.comments?.length || 0}</strong></p>
                  <p><ClockCircleOutlined /> Thời gian đọc: <strong>{statsBlog.readingTime || 0} phút</strong></p>
                </div>
              </div>
            </Card>
            
            <Card title="Đánh giá">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Rate disabled defaultValue={statsBlog.rating || 0} />
                <span style={{ marginLeft: 10 }}>{statsBlog.rating || 0}/5</span>
              </div>
            </Card>
            
            {statsBlog.tags && statsBlog.tags.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>Tags:</strong>
                <div style={{ marginTop: 8 }}>
                  {statsBlog.tags.map(tag => (
                    <Tag key={tag} color="green">{tag}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Chi tiết Blog */}
      <Modal
        title={detailBlog?.blogTitle}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setIsDetailModalVisible(false);
              showEditModal(detailBlog);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
      >
        {detailBlog && (
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <div style={{ marginBottom: 20 }}>
              <Space>
                <Tag color="blue">{getCategoryLabel(detailBlog.category)}</Tag>
                {detailBlog.tags && detailBlog.tags.map(tag => (
                  <Tag key={tag} color="green">{tag}</Tag>
                ))}
              </Space>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <Space>
                <Tooltip title="Lượt xem">
                  <span><EyeOutlined /> {detailBlog.views || 0}</span>
                </Tooltip>
                <Tooltip title="Lượt thích">
                  <span><LikeOutlined /> {detailBlog.likes || 0}</span>
                </Tooltip>
                <Tooltip title="Thời gian đọc">
                  <span><ClockCircleOutlined /> {detailBlog.readingTime || 0} phút</span>
                </Tooltip>
                <span>Tác giả: {detailBlog.author}</span>
                <span>Ngày tạo: {new Date(detailBlog.createDate).toLocaleDateString()}</span>
              </Space>
            </div>
            
            {detailBlog.thumbnail && (
              <div style={{ marginBottom: 20 }}>
                <img 
                  src={detailBlog.thumbnail} 
                  alt={detailBlog.blogTitle} 
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                />
              </div>
            )}
            
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {detailBlog.blogContent}
            </div>
            
            {detailBlog.comments && detailBlog.comments.length > 0 && (
              <div style={{ marginTop: 30 }}>
                <h3>Bình luận ({detailBlog.comments.length})</h3>
                {detailBlog.comments.map((comment, index) => (
                  <div key={index} style={{ marginBottom: 10, padding: 10, border: '1px solid #f0f0f0', borderRadius: 5 }}>
                    <div style={{ marginBottom: 5 }}>
                      <Text strong>User ID: {comment.userId}</Text>
                      <Text type="secondary" style={{ marginLeft: 10 }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </div>
                    <div>{comment.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Chỉnh sửa Blog */}
      <Modal
        title="Chỉnh sửa blog"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="blogTitle"
            label="Tiêu đề"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề!" },
              {
                whitespace: true,
                message: "Không được chỉ nhập khoảng trắng!",
              },
            ]}
          >
            <Input maxLength={200} />
          </Form.Item>

          <Form.Item
            name="blogContent"
            label="Nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung!" },
              {
                whitespace: true,
                message: "Không được chỉ nhập khoảng trắng!",
              },
            ]}
          >
            <Input.TextArea rows={8} maxLength={10000} />
          </Form.Item>

          <Form.Item
            name="author"
            label="Tác giả"
            rules={[
              { required: true, message: "Vui lòng nhập tên tác giả!" },
              {
                whitespace: true,
                message: "Không được chỉ nhập khoảng trắng!",
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[
              { required: true, message: "Vui lòng chọn danh mục!" },
            ]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
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
            name="thumbnail"
            label="Thumbnail URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Cập nhật
            </Button>
            <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tạo Blog Mới */}
      <Modal
        title="Create New Blog"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="blogTitle"
            label="Title"
            rules={[{ required: true, message: "Please input blog title!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="blogContent"
            label="Content"
            rules={[{ required: true, message: "Please input blog content!" }]}
          >
            <Input.TextArea rows={8} />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: "Please input author name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select placeholder="Select a category">
              {categories.map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags (comma separated)"
          >
            <Input placeholder="tag1, tag2, tag3" />
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label="Thumbnail URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogManagement;
