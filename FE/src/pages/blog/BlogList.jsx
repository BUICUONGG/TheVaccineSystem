import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Tag, Space } from "antd";
import { EyeOutlined, HeartOutlined } from "@ant-design/icons";
import axios from "../../config/axios";
import "./BlogList.css";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("/blogs/showData");
      setBlogs(response.data);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  return (
    <div className="blog-list-container">
      <div className="blog-header">
        <h1>Câu Chuyện Vaccine</h1>
        <p>Những câu chuyện ý nghĩa về việc tiêm chủng đã cứu sống nhiều trẻ em</p>
      </div>

      <Row gutter={[24, 24]}>
        {blogs.map((blog) => (
          <Col xs={24} sm={12} lg={8} key={blog._id}>
            <Link to={`/blog/${blog._id}`}>
              <Card
                hoverable
                cover={
                  <img 
                    alt={blog.blogTitle}
                    src={blog.thumbnail}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={blog.blogTitle}
                  description={blog.summary}
                />
                <div className="blog-meta">
                  <Space>
                    <span>By {blog.author}</span>
                    <span>{new Date(blog.createDate).toLocaleDateString()}</span>
                  </Space>
                  <Space>
                    <span><EyeOutlined /> {blog.views}</span>
                    <span><HeartOutlined /> {blog.likes}</span>
                  </Space>
                </div>
                <div className="blog-tags">
                  {blog.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BlogList; 