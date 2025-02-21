import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "../../../config/axios";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingBlog, setEditingBlog] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("/blogs");
      setBlogs(response.data);
    } catch (error) {
      message.error("Failed to fetch blogs");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.blogId)}
          />
        </>
      ),
    },
  ];

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    form.setFieldsValue(blog);
    setContent(blog.content);
    setIsModalVisible(true);
  };

  const handleDelete = async (blogId) => {
    try {
      await axios.delete(`/blogs/${blogId}`);
      message.success("Blog deleted successfully");
      fetchBlogs();
    } catch (error) {
      message.error("Failed to delete blog");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const blogData = {
        ...values,
        content,
        author: localStorage.getItem("username"),
      };

      if (editingBlog) {
        await axios.put(`/blogs/${editingBlog.blogId}`, blogData);
        message.success("Blog updated successfully");
      } else {
        await axios.post("/blogs", blogData);
        message.success("Blog created successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      setContent("");
      setEditingBlog(null);
      fetchBlogs();
    } catch (error) {
      message.error("Failed to save blog");
    }
  };

  return (
    <div className="blog-management">
      <div className="header">
        <h2>Blog Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBlog(null);
            form.resetFields();
            setContent("");
            setIsModalVisible(true);
          }}
        >
          Create New Blog
        </Button>
      </div>

      <Table columns={columns} dataSource={blogs} rowKey="blogId" />

      <Modal
        title={editingBlog ? "Edit Blog" : "Create New Blog"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please input blog title!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="summary"
            label="Summary"
            rules={[{ required: true, message: "Please input blog summary!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Content" required>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              style={{ height: "200px", marginBottom: "50px" }}
            />
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label="Thumbnail URL"
            rules={[{ required: true, message: "Please input thumbnail URL!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags (comma separated)"
            rules={[{ required: true, message: "Please input tags!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status!" }]}
          >
            <Select>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="published">Published</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingBlog ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogManagement; 