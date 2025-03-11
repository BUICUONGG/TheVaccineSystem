import { useState, useEffect } from "react";
import { Card, Row, Col, Typography } from "antd";
import {
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
// import axios from "axios";
import "./BlogList.css";
import axiosInstance from "../../service/api";

const { Title, Paragraph } = Typography;

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedStates, setLikedStates] = useState({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchBlogs();
    setVisible(true);
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/blogs/showBlog", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      const activeBlogs = response.data.filter(blog => blog.status === "active");
      const blogsWithViews = activeBlogs.map((blog) => ({
        ...blog,
        views: 1000,
      }));
      setBlogs(blogsWithViews);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  const toggleLike = (blogId) => {
    setLikedStates((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));
  };

  return (
    <div className="blog-container">
      <div className="back-home-wrapper">
        <Link to="/homepage" className="back-home">
          Back home
        </Link>
      </div>

      <Title level={1} className={`main-title ${visible ? "fade-in" : ""}`}>
        Câu Chuyện Vaccine
      </Title>

      <Row gutter={[16, 16]}>
        {blogs.map((blog, index) => (
          <Col span={8} key={blog._id}>
            <Card
              loading={loading}
              className={`fade-in-blog`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <img
                src={blog.imageUrl || "./images/blog1.png"}
                alt="blog"
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <Title level={4}>{blog.blogTitle}</Title>
              <Paragraph>{blog.blogContent}</Paragraph>
              <div className="author-spoiler">
                <div className="author-content">
                  <span>Tác giả: {blog.author}</span>
                  <br />
                  <span>
                    Ngày: {new Date(blog.createDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="blog-actions">
                <span
                  className={`like-button ${
                    likedStates[blog._id] ? "liked" : ""
                  }`}
                  onClick={() => toggleLike(blog._id)}
                >
                  {likedStates[blog._id] ? <HeartFilled /> : <HeartOutlined />}
                </span>
                <CommentOutlined />
                <ShareAltOutlined />
                <span className="views-count">
                  <EyeOutlined /> 1000
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BlogList;
