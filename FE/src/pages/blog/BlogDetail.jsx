import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Typography, Tag, Space, Divider, Button, Spin, Avatar, Comment, Form, Input, Rate, Card, Row, Col, Tooltip, Modal } from "antd";
import {
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  TagOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import slugify from 'slugify';
import axiosInstance from "../../service/api";
import "./BlogDetail.css";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [liked, setLiked] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogBySlug();
  }, [slug]);

  // Hàm tạo slug an toàn từ tiếng Việt
  const createSafeSlug = (text) => {
    return slugify(text, {
      lower: true,      // Chuyển thành chữ thường
      strict: true,     // Loại bỏ các ký tự đặc biệt
      locale: 'vi'      // Hỗ trợ tiếng Việt
    });
  };

  const fetchBlogBySlug = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy danh sách tất cả các blog
      const response = await axiosInstance.get("/blogs/showBlog", {
        params: { status: "active" },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      const blogs = response.data.blogs || response.data;
      
      // Tìm blog có slug khớp với slug trong URL
      // Chúng ta sẽ so sánh slug được tạo từ tiêu đề với slug trong URL
      const foundBlog = blogs.find(blog => createSafeSlug(blog.blogTitle) === slug);
      
      if (!foundBlog) {
        setError("Không tìm thấy bài viết");
        setLoading(false);
        return;
      }
      
      setBlog(foundBlog);
      
      // Tăng lượt xem
      await incrementViews(foundBlog._id);
      
      // Lấy các bài viết liên quan
      if (foundBlog.category) {
        fetchRelatedBlogs(foundBlog._id, foundBlog.category, foundBlog.tags || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (blogId, category, tags) => {
    try {
      const response = await axiosInstance.get(`/blogs/related/${blogId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      setRelatedBlogs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch related blogs:", error);
    }
  };

  const incrementViews = async (blogId) => {
    try {
      await axiosInstance.post(`/blogs/incrementViews/${blogId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
    } catch (error) {
      console.error("Failed to increment views:", error);
    }
  };

  const toggleLike = async () => {
    if (!blog) return;
    
    try {
      await axiosInstance.post(`/blogs/like/${blog._id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      setLiked(!liked);
      setBlog({
        ...blog,
        likes: liked ? blog.likes - 1 : blog.likes + 1
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      Modal.error({
        title: "Lỗi",
        content: "Bạn cần đăng nhập để thích bài viết này."
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !blog) return;
    
    try {
      setSubmittingComment(true);
      
      await axiosInstance.post(`/blogs/comment/${blog._id}`, {
        content: commentContent
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      // Refresh blog data to get updated comments
      fetchBlogBySlug();
      setCommentContent("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      Modal.error({
        title: "Lỗi",
        content: "Bạn cần đăng nhập để bình luận."
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRatingChange = async (value) => {
    if (!blog) return;
    
    try {
      await axiosInstance.post(`/blogs/rate/${blog._id}`, {
        rating: value
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      setUserRating(value);
      setBlog({
        ...blog,
        rating: value
      });
      
      Modal.success({
        content: "Cảm ơn bạn đã đánh giá bài viết!"
      });
    } catch (error) {
      console.error("Failed to submit rating:", error);
      Modal.error({
        title: "Lỗi",
        content: "Bạn cần đăng nhập để đánh giá bài viết này."
      });
    }
  };

  const getCategoryLabel = (value) => {
    const categories = [
      { value: "lich-tiem-chung", label: "Lịch tiêm chủng" },
      { value: "hoat-dong-tiem-chung", label: "Hoạt động tiêm chủng" },
      { value: "quy-trinh-tiem-chung", label: "Quy trình tiêm chủng" },
      { value: "nhung-dieu-can-biet-truoc-khi-tiem", label: "Những điều cần biết trước khi tiêm" },
      { value: "nhung-dieu-can-biet-sau-khi-tiem", label: "Những điều cần biết sau khi tiêm" },
      { value: "khac", label: "Khác" }
    ];
    
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <Spin size="large" />
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-error">
        <Title level={3}>{error}</Title>
        <Button type="primary" onClick={() => navigate("/blog")}>
          <ArrowLeftOutlined /> Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-error">
        <Title level={3}>Không tìm thấy bài viết</Title>
        <Button type="primary" onClick={() => navigate("/blog")}>
          <ArrowLeftOutlined /> Quay lại danh sách bài viết
        </Button>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-header">
        <div className="blog-detail-nav">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/blog")}>
              Quay lại
            </Button>
            <Link to="/homepage">
              <Button icon={<HomeOutlined />}>Trang chủ</Button>
            </Link>
          </Space>
        </div>
        
        <Title level={2} className="blog-detail-title">
          {blog.blogTitle}
        </Title>
        
        <div className="blog-detail-meta">
          <Space split={<Divider type="vertical" />}>
            <span>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text style={{ marginLeft: 8 }}>{blog.author}</Text>
            </span>
            <span>
              <CalendarOutlined />
              <Text style={{ marginLeft: 8 }}>{new Date(blog.createDate).toLocaleDateString()}</Text>
            </span>
            <span>
              <Tag color="blue">{getCategoryLabel(blog.category)}</Tag>
            </span>
            <span>
              <ClockCircleOutlined /> {blog.readingTime || 5} phút đọc
            </span>
          </Space>
        </div>
        
        <div className="blog-detail-stats">
          <Tooltip title="Lượt xem">
            <span className="stat-item">
              <EyeOutlined /> {blog.views || 0}
            </span>
          </Tooltip>
          
          <Tooltip title={liked ? "Bỏ thích" : "Thích"}>
            <span 
              className={`stat-item like-button ${liked ? "liked" : ""}`}
              onClick={toggleLike}
            >
              {liked ? <HeartFilled /> : <HeartOutlined />} {blog.likes || 0}
            </span>
          </Tooltip>
          
          <Tooltip title="Bình luận">
            <span className="stat-item">
              <CommentOutlined /> {blog.comments?.length || 0}
            </span>
          </Tooltip>
        </div>
      </div>
      
      {blog.thumbnail && (
        <div className="blog-detail-thumbnail">
          <img src={blog.thumbnail} alt={blog.blogTitle} />
        </div>
      )}
      
      <div className="blog-detail-content">
        <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.8' }}>
          {blog.blogContent}
        </Paragraph>
      </div>
      
      {blog.tags && blog.tags.length > 0 && (
        <div className="blog-detail-tags">
          <TagOutlined /> Tags:
          <div style={{ marginTop: 8 }}>
            {blog.tags.map(tag => (
              <Tag key={tag} color="green">{tag}</Tag>
            ))}
          </div>
        </div>
      )}
      
      <Divider />
      
      <div className="blog-detail-rating">
        <Title level={4}>Đánh giá bài viết</Title>
        <div>
          <Rate 
            allowHalf 
            value={userRating || blog.rating || 0} 
            onChange={handleRatingChange} 
          />
          <Text style={{ marginLeft: 10 }}>
            {blog.rating ? `${blog.rating}/5` : "Chưa có đánh giá"}
          </Text>
        </div>
      </div>
      
      <Divider />
      
      <div className="blog-detail-comments">
        <Title level={4}>Bình luận ({blog.comments?.length || 0})</Title>
        
        <Form onFinish={handleCommentSubmit} className="comment-form">
          <Form.Item>
            <TextArea 
              rows={4} 
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              placeholder="Viết bình luận của bạn..."
            />
          </Form.Item>
          <Form.Item>
            <Button 
              htmlType="submit" 
              type="primary"
              loading={submittingComment}
              disabled={!commentContent.trim()}
            >
              Gửi bình luận
            </Button>
          </Form.Item>
        </Form>
        
        {blog.comments && blog.comments.length > 0 ? (
          <div className="comment-list">
            {blog.comments.map((comment, index) => (
              <Comment
                key={index}
                author={<Text strong>Người dùng</Text>}
                avatar={<Avatar icon={<UserOutlined />} />}
                content={<p>{comment.content}</p>}
                datetime={<span>{new Date(comment.createdAt).toLocaleString()}</span>}
              />
            ))}
          </div>
        ) : (
          <div className="no-comments">
            <Text type="secondary">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</Text>
          </div>
        )}
      </div>
      
      {relatedBlogs.length > 0 && (
        <div className="blog-detail-related">
          <Title level={4}>Bài viết liên quan</Title>
          <Row gutter={[16, 16]}>
            {relatedBlogs.map(relatedBlog => (
              <Col xs={24} sm={12} md={8} key={relatedBlog._id}>
                <Card 
                  hoverable
                  cover={relatedBlog.thumbnail && <img alt={relatedBlog.blogTitle} src={relatedBlog.thumbnail} />}
                  onClick={() => navigate(`/blog/${createSafeSlug(relatedBlog.blogTitle)}`)}
                >
                  <Card.Meta
                    title={relatedBlog.blogTitle}
                    description={
                      <div>
                        <div>{relatedBlog.blogContent.substring(0, 100)}...</div>
                        <div style={{ marginTop: 8 }}>
                          <Space>
                            <span><EyeOutlined /> {relatedBlog.views || 0}</span>
                            <span><CommentOutlined /> {relatedBlog.comments?.length || 0}</span>
                          </Space>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default BlogDetail; 