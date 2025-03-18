import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Popconfirm, Select, Tag, Rate, Typography, Space, Tooltip, Divider, Badge, Card, Empty, Title } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, FilterOutlined, EyeOutlined, ClockCircleOutlined, LikeOutlined, CommentOutlined, InfoCircleOutlined, StarOutlined, UndoOutlined } from "@ant-design/icons";
import axiosInstance from "../../../service/api";

const { Search } = Input;
const { Option } = Select;
const { Text, Paragraph } = Typography;

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isStatsModalVisible, setIsStatsModalVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [detailBlog, setDetailBlog] = useState(null);
  const [statsBlog, setStatsBlog] = useState(null);
  const [currentBlogComments, setCurrentBlogComments] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const pageSize = 10;

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
    if (searchText) {
    const filtered = blogs.filter(
        (item) =>
          item.blogTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.blogContent?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredBlogs(filtered);
    } else {
      setFilteredBlogs(blogs);
    }
  }, [blogs, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleCategoryFilter = (value) => {
    setCategoryFilter(value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const fetchBlogs = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/blog/showBlog", {
        params: {
          page: page,
          limit: pageSize,
          includeDeleted: true
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      const blogsData = response.data.blogs || [];
      const total = response.data.total || 0;
      
      setBlogs(blogsData);
      setFilteredBlogs(blogsData);
      setTotalBlogs(total);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      Modal.error({
        content: "Không thể tải danh sách blog",
      });
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    fetchBlogs(pagination.current);
  };

  const handleCreate = async (values) => {
    try {
      let tags = [];
      if (values.tags) {
        tags = values.tags.split(',').map(tag => tag.trim());
      }

      await axiosInstance.post(
        "/blog/create",
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
      };

      await axiosInstance.post(
        `/blog/update/${editingBlog._id}`,
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
        `/blog/delete/${blogId}`,
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
        `/blog/restore/${blogId}`,
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

  const showCommentsModal = (blog) => {
    setCurrentBlogComments(blog);
    setIsCommentsModalVisible(true);
  };

  const handleCommentStatusChange = async (blogId, commentId, status) => {
    try {
      let endpoint = status === "active" ? "show" : "hide";
      
      await axiosInstance.post(
        `/blog/comment/${blogId}/${commentId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      // Refresh blog data after comment status change
      fetchBlogs();
      
      // If the modal is still open, refresh the current blog comments
      if (currentBlogComments && currentBlogComments._id === blogId) {
        const updatedBlog = await axiosInstance.get(`/blog/detail/${blogId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        });
        setCurrentBlogComments(updatedBlog.data);
      }

      Modal.success({
        content: `Bình luận đã được ${status === "active" ? "hiện" : "ẩn"} thành công!`,
      });
    } catch (error) {
      console.error(`Error ${status === "active" ? "showing" : "hiding"} comment:`, error);
      Modal.error({
        content: `Không thể ${status === "active" ? "hiện" : "ẩn"} bình luận`,
      });
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 60,
    },
    {
      title: "Tiêu đề",
      dataIndex: "blogTitle",
      key: "blogTitle",
      ellipsis: true,
      width: 250,
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 150,
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 200,
      filters: [
        { text: "Lịch tiêm chủng", value: "lich-tiem-chung" },
        { text: "Hoạt động tiêm chủng", value: "hoat-dong-tiem-chung" },
        { text: "Quy trình tiêm chủng", value: "quy-trinh-tiem-chung" },
        { text: "Những điều cần biết trước khi tiêm", value: "nhung-dieu-can-biet-truoc-khi-tiem" },
        { text: "Những điều cần biết sau khi tiêm", value: "nhung-dieu-can-biet-sau-khi-tiem" },
        { text: "Khác", value: "khac" }
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag color={
          category === "lich-tiem-chung" ? "blue" :
          category === "hoat-dong-tiem-chung" ? "green" :
          category === "quy-trinh-tiem-chung" ? "orange" :
          category === "nhung-dieu-can-biet-truoc-khi-tiem" ? "red" :
          category === "nhung-dieu-can-biet-sau-khi-tiem" ? "purple" :
          "default"
        }>
          {getCategoryLabel(category) || "Chưa phân loại"}
        </Tag>
      ),
    },
    {
      title: "Bình luận",
      dataIndex: "comments",
      key: "comments",
      width: 120,
      render: (comments, record) => (
        <Tooltip title="Xem bình luận">
          <Button 
            icon={<CommentOutlined />} 
            onClick={() => showCommentsModal(record)}
          >
            {comments?.length || 0}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Tạm ẩn", value: "none" }
      ],
      onFilter: (value, record) => record.status === value,
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          </Tooltip>
          {record.status === "active" ? (
            <Tooltip title="Lưu trữ">
          <Popconfirm
                title="Bạn có chắc chắn muốn lưu trữ blog này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          ) : (
            <Tooltip title="Khôi phục">
              <Popconfirm
                title="Bạn có chắc chắn muốn khôi phục blog này?"
                onConfirm={() => handleRestore(record._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button type="primary" icon={<UndoOutlined />} />
          </Popconfirm>
            </Tooltip>
          )}
        </Space>
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
        <h2>Quản lý Blog</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Tạo Blog mới
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
          placeholder="Tìm kiếm theo tiêu đề hoặc nội dung"
        enterButton
        onSearch={handleSearch}
          style={{ width: 300 }}
      />
        
        <Button onClick={fetchBlogs} type="default">
          Làm mới dữ liệu
        </Button>
      </div>

      <Table
        dataSource={filteredBlogs}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalBlogs,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} bài viết`,
        }}
        onChange={handleTableChange}
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
          </Button>
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

      {/* Modal Quản lý bình luận */}
      <Modal
        title="Quản lý bình luận"
        open={isCommentsModalVisible}
        onCancel={() => setIsCommentsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsCommentsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {currentBlogComments && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>{currentBlogComments.blogTitle}</Title>
              <Text type="secondary">Tổng số bình luận: {currentBlogComments.comments?.length || 0}</Text>
            </div>

            {currentBlogComments.comments && currentBlogComments.comments.length > 0 ? (
              <div className="comments-list">
                {currentBlogComments.comments.map((comment, index) => (
                  <Card 
                    key={index} 
                    style={{ marginBottom: 16 }}
                    extra={
                      <Space>
                        {comment.status === "active" ? (
                          <Popconfirm
                            title="Bạn có chắc chắn muốn ẩn bình luận này?"
                            onConfirm={() => handleCommentStatusChange(currentBlogComments._id, comment.userId, "hidden")}
                            okText="Có"
                            cancelText="Không"
                          >
                            <Button danger size="small">Ẩn</Button>
                          </Popconfirm>
                        ) : (
                          <Popconfirm
                            title="Bạn có chắc chắn muốn hiển thị bình luận này?"
                            onConfirm={() => handleCommentStatusChange(currentBlogComments._id, comment.userId, "active")}
                            okText="Có"
                            cancelText="Không"
                          >
                            <Button type="primary" size="small">Hiển thị</Button>
                          </Popconfirm>
                        )}
                      </Space>
                    }
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <Text strong>User ID: {comment.userId.toString()}</Text>
                        <Badge
                          style={{ marginLeft: 8 }}
                          status={comment.status === "active" ? "success" : "error"}
                          text={comment.status === "active" ? "Hiển thị" : "Đã ẩn"}
                        />
                      </div>
                      <Text type="secondary">{new Date(comment.createdAt).toLocaleString()}</Text>
                    </div>
                    <Paragraph
                      style={{
                        opacity: comment.status === "active" ? 1 : 0.5,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {comment.content}
                    </Paragraph>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có bình luận nào" />
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
