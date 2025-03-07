import { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Form, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

import axiosInstance from "../../../service/api";

const { Search } = Input;

const BlogManagement = () => {
  // const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form] = Form.useForm();
  // const [editForm] = Form.useForm();

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter blogs when searchText changes
  useEffect(() => {
    const filtered = blogs.filter(
      (blog) =>
        blog.blogTitle.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredBlogs(filtered);
  }, [blogs, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/blogs/showBlog", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      setBlogs(response.data);
      setFilteredBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Modal.error({
        content: "Failed to fetch blogs",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      await axiosInstance.post(
        "/blogs/createBlog",
        {
          ...values,
          userId: "67b53056af240f16ecf58a5c", // Thay thế bằng userId thực tế
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      Modal.success({
        content: "Blog created successfully",
      });

      setIsModalVisible(false);
      form.resetFields();
      fetchBlogs(); // Refresh danh sách blog
    } catch (error) {
      console.error("Error creating blog:", error);
      Modal.error({
        content: "Failed to create blog",
      });
    }
  };

  const handleUpdate = async (values) => {
    try {
      // Validate data before sending
      const updatedData = {
        blogTitle: values.blogTitle?.trim() || null,
        blogContent: values.blogContent?.trim() || null,
        author: values.author?.trim() || null,
        status: editingBlog.status,
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
        content: "Xóa blog thành công!",
      });

      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      Modal.error({
        content: "Không thể xóa blog",
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
      dataIndex: "blogTitle",
      key: "blogTitle",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Content",
      dataIndex: "blogContent",
      key: "blogContent",
      ellipsis: true,
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      render: (text) => text || "Chưa cập nhật",
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: 100,
    },
    {
      title: "Likes",
      dataIndex: "likes",
      key: "likes",
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <span
          style={{
            color: status === "active" ? "#52c41a" : "#ff4d4f",
            textTransform: "capitalize",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createDate",
      key: "createDate",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
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
            title="Xóa blog"
            description="Bạn có chắc chắn muốn xóa blog này?"
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

  const showEditModal = (blog) => {
    setEditingBlog(blog);
    form.setFieldsValue({
      blogTitle: blog.blogTitle,
      blogContent: blog.blogContent,
      author: blog.author,
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

      <Search
        placeholder="Search by title or author"
        allowClear
        enterButton
        onSearch={handleSearch}
        style={{ width: 300, marginBottom: 16 }}
      />

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
      />

      <Modal
        title="Chỉnh sửa blog"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
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
            <Input.TextArea rows={4} maxLength={1000} />
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

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Cập nhật
            </Button>
            <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create New Blog"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
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
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: "Please input author name!" }]}
          >
            <Input />
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
