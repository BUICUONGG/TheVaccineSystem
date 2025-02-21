import { useState, useEffect } from "react";
import { Card, Row, Col, Space, Typography } from "antd";
import { EyeOutlined, HeartOutlined } from "@ant-design/icons";
import axios from "axios";
import "./BlogList.css";

const { Title, Paragraph } = Typography;

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("http://localhost:8080/blogs/showBlog");
      setBlogs(response.data);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  return (
    <div className="blog-list-container">
      <div className="blog-header">
        <Title level={1}>Câu Chuyện Vaccine</Title>
        <Paragraph>
          Những câu chuyện ý nghĩa về việc tiêm chủng đã cứu sống nhiều trẻ em
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} className="blog-grid">
        {blogs.map((blog, index) => (
          <Col xs={24} sm={12} lg={8} key={blog._id} className="blog-card-wrapper">
            <Card
              hoverable
              className="blog-card"
              cover={<img alt="blog cover" src="./images/blog1.jpg" className="blog-image" />}
            >
              <div className="blog-content">
                <Title level={3} className="blog-title">{blog.blogTitle}</Title>
                <Paragraph className="blog-excerpt">{blog.blogContent}</Paragraph>
                
                <div className="blog-meta">
                  <Space>
                    <span className="author">By {blog.author}</span>
                    <span className="date">
                      {new Date(blog.createDate).toLocaleDateString()}
                    </span>
                  </Space>
                  <Space className="blog-stats">
                    <span className="views">
                      <EyeOutlined /> {blog.views}
                    </span>
                    <span className="likes">
                      <HeartOutlined /> {blog.likes}
                    </span>
                  </Space>
                </div>

                <div className="blog-status">
                  <span className={`status-tag ${blog.status}`}>
                    {blog.status}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BlogList; 