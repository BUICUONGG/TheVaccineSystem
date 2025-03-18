import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Tag, Space, Divider, Select, Input, Button, Tooltip, Spin, Avatar, List, message, Modal, Form } from "antd";
import {
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  SearchOutlined,
  TagOutlined,
  UserOutlined,
  CalendarOutlined,
  FireOutlined,
  RiseOutlined,
  BarsOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import slugify from 'slugify';
import { Link } from "react-router-dom";
import "./BlogList.css";
import axiosInstance from "../../service/api";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedStates, setLikedStates] = useState({});
  const [visible, setVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Danh sách các danh mục blog
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
    fetchPopularTags();
    setVisible(true);
  }, [categoryFilter, tagFilter, searchKeyword, sortBy]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      // Xây dựng tham số truy vấn
      const params = {
        status: "active"
      };
      
      if (categoryFilter) params.category = categoryFilter;
      if (tagFilter) params.tags = tagFilter;
      if (searchKeyword) params.keyword = searchKeyword;
      
      // Xử lý sắp xếp
      if (sortBy === "newest") {
        params.sortBy = "createDate";
        params.sortOrder = "desc";
      } else if (sortBy === "popular") {
        params.sortBy = "views";
        params.sortOrder = "desc";
      } else if (sortBy === "mostCommented") {
        params.sortBy = "comments";
        params.sortOrder = "desc";
      }
      
      const response = await axiosInstance.get("/blog/showBlog", {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      const blogsData = response.data.blogs || response.data;
      setBlogs(blogsData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setLoading(false);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await axiosInstance.get("/blog/tags/popular", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      setPopularTags(response.data || []);
    } catch (error) {
      console.error("Failed to fetch popular tags:", error);
    }
  };

  const toggleLike = async (blogId) => {
    try {
      await axiosInstance.post(`/blog/like/${blogId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
    setLikedStates((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));
      
      // Cập nhật số lượt thích trong danh sách blog
      setBlogs(blogs.map(blog => {
        if (blog._id === blogId) {
          return {
            ...blog,
            likes: likedStates[blogId] ? (blog.likes - 1) : (blog.likes + 1)
          };
        }
        return blog;
      }));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
  };

  const handleTagClick = (tag) => {
    setTagFilter(tag);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const getCategoryLabel = (value) => {
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  // Hàm cắt ngắn nội dung
  const truncateContent = (content, maxLength = 150) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + "...";
  };

  // Hàm tăng lượt xem khi người dùng xem chi tiết bài viết
  const incrementViews = async (blogId) => {
    try {
      const response = await axiosInstance.post(`/blog/view/${blogId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      // Cập nhật state để hiển thị lượt xem mới
      setBlogs(blogs.map(blog => {
        if (blog._id === blogId) {
          return {
            ...blog,
            views: (blog.views || 0) + 1
          };
        }
        return blog;
      }));
      
      return response.data;
    } catch (error) {
      console.error("Failed to increment views:", error);
    }
  };

  // Xử lý khi người dùng nhấp vào để xem chi tiết bài viết
  const handleViewBlogDetail = (blog) => {
    // Tăng lượt xem
    incrementViews(blog._id);
    
    // Lấy chi tiết blog nếu cần
    fetchBlogDetail(blog._id);
  };

  // Fetch blog detail with comments
  const fetchBlogDetail = async (blogId) => {
    try {
      const response = await axiosInstance.get(`/blog/detail/${blogId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      if (response.data) {
        setSelectedBlog(response.data);
        setIsDetailModalVisible(true);
      }
    } catch (error) {
      console.error("Failed to fetch blog detail:", error);
      message.error("Không thể tải chi tiết bài viết");
    }
  };

  // Handle closing the detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedBlog(null);
    setCommentContent("");
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !selectedBlog) return;
    
    try {
      setSubmittingComment(true);
      
      await axiosInstance.post(`/blog/comment/${selectedBlog._id}`, {
        content: commentContent
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      // Refresh blog detail to show the new comment
      const updatedBlogResponse = await axiosInstance.get(`/blog/detail/${selectedBlog._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      if (updatedBlogResponse.data) {
        const updatedBlog = updatedBlogResponse.data;
        
        // Update selectedBlog state with new data
        setSelectedBlog(updatedBlog);
        
        // Update blogs state to reflect the new comment count
        setBlogs(prevBlogs => 
          prevBlogs.map(blog => 
            blog._id === updatedBlog._id 
              ? { ...blog, comments: updatedBlog.comments } 
              : blog
          )
        );
      }
      
      setCommentContent("");
      message.success("Bình luận đã được thêm");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      message.error("Bạn cần đăng nhập để bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Hàm tạo slug an toàn từ tiếng Việt
  const createSafeSlug = (text) => {
    return slugify(text, {
      lower: true,      // Chuyển thành chữ thường
      strict: true,     // Loại bỏ các ký tự đặc biệt
      locale: 'vi'      // Hỗ trợ tiếng Việt
    });
  };

  // Render blog item
  const renderBlogItem = (blog, index) => (
    <Card 
      key={blog._id}
      className={`blog-card fade-in-blog`} 
      style={{ animationDelay: `${index * 0.1}s` }}
      bordered={false}
      onClick={() => handleViewBlogDetail(blog)}
      hoverable
    >
      <Row gutter={[16, 0]}>
        {blog.thumbnail && (
          <Col xs={24} sm={6} md={4} lg={4}>
            <div className="blog-thumbnail">
              <img 
                src={blog.thumbnail || "./images/blog1.png"} 
                alt={blog.blogTitle}
              />
            </div>
          </Col>
        )}
        
        <Col xs={24} sm={blog.thumbnail ? 18 : 24} md={blog.thumbnail ? 20 : 24} lg={blog.thumbnail ? 20 : 24}>
          <div className="blog-content">
            <Title level={4} className="blog-title">{blog.blogTitle}</Title>
            
            <div className="blog-meta">
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
              </Space>
            </div>
            
            <Paragraph className="blog-excerpt">
              {truncateContent(blog.blogContent, 180)}
            </Paragraph>
            
            <div className="blog-footer">
              <div className="blog-tags">
                {blog.tags && blog.tags.map(tag => (
                  <Tag 
                    key={tag} 
                    color="green" 
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTagClick(tag);
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
              
              <div className="blog-stats">
                <Tooltip title="Lượt xem">
                  <span className="stat-item">
                    <EyeOutlined /> {blog.views || 0}
                  </span>
                </Tooltip>
                
                <Tooltip title={likedStates[blog._id] ? "Bỏ thích" : "Thích"}>
                  <span 
                    className={`stat-item like-button ${likedStates[blog._id] ? "liked" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleLike(blog._id);
                    }}
                  >
                    {likedStates[blog._id] ? <HeartFilled /> : <HeartOutlined />} {blog.likes || 0}
                  </span>
                </Tooltip>
                
                <Tooltip title="Bình luận">
                  <span className="stat-item">
                    <CommentOutlined /> {blog.comments?.length || 0}
                  </span>
                </Tooltip>
                
                <Tooltip title="Thời gian đọc">
                  <span className="stat-item">
                    <ClockCircleOutlined /> {blog.readingTime || 5} phút
                  </span>
                </Tooltip>
              </div>
            </div>
            
            {/* Nút xem chi tiết (chỉ hiển thị, click vào card cũng sẽ mở chi tiết) */}
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Button 
                type="primary" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewBlogDetail(blog);
                }}
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="blog-container">
      <div className="blog-header">
        <Title level={2} className={`main-title ${visible ? "fade-in" : ""}`}>
          Câu Chuyện Vaccine
        </Title>
        
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Link to="/homepage">
              <Button icon={<HomeOutlined />}>Trang chủ</Button>
            </Link>
          </Space>
        </div>
      </div>
      
      <div className="blog-layout">
        {/* Main content - Danh sách bài viết */}
        <div className="blog-main">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="no-blogs">
              <Title level={4}>Không tìm thấy bài viết nào</Title>
              <Paragraph>Vui lòng thử lại với các bộ lọc khác</Paragraph>
            </div>
          ) : (
            <div className="blog-list">
              {blogs.map((blog, index) => renderBlogItem(blog, index))}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="blog-sidebar">
          {/* Tìm kiếm */}
          <div className="sidebar-card">
            <Search
              placeholder="Tìm kiếm bài viết..."
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </div>
          
          {/* Bộ lọc */}
          <div className="sidebar-card">
            <div className="sidebar-title">Bộ lọc</div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Danh mục:</div>
              <Select
                placeholder="Chọn danh mục"
                style={{ width: '100%' }}
                onChange={handleCategoryChange}
                allowClear
                suffixIcon={<FilterOutlined />}
              >
                {categories.map(category => (
                  <Option key={category.value} value={category.value}>
                    {category.label}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div>
              <div style={{ marginBottom: 8 }}>Sắp xếp theo:</div>
              <Select
                style={{ width: '100%' }}
                defaultValue="newest"
                onChange={handleSortChange}
              >
                <Option value="newest"><CalendarOutlined /> Mới nhất</Option>
                <Option value="popular"><FireOutlined /> Phổ biến nhất</Option>
                <Option value="mostCommented"><CommentOutlined /> Nhiều bình luận nhất</Option>
              </Select>
            </div>
          </div>
          
          {/* Tags phổ biến */}
          {popularTags.length > 0 && (
            <div className="sidebar-card">
              <div className="sidebar-title">
                <TagOutlined /> Tags phổ biến
              </div>
              <div>
                {popularTags.slice(0, 15).map(tag => (
                  <Tag 
                    key={tag.name} 
                    color="blue" 
                    style={{ cursor: 'pointer', margin: '0 4px 8px 0' }}
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name} ({tag.count})
                  </Tag>
                ))}
              </div>
            </div>
          )}
          
          {/* Thông tin hữu ích */}
          <div className="sidebar-card">
            <div className="sidebar-title">Thông tin hữu ích</div>
            <List
              size="small"
              dataSource={[
                { icon: <CalendarOutlined />, text: "Lịch tiêm chủng" },
                { icon: <RiseOutlined />, text: "Hoạt động tiêm chủng" },
                { icon: <BarsOutlined />, text: "Quy trình tiêm chủng" }
              ]}
              renderItem={item => (
                <List.Item>
                  <Space>
                    {item.icon}
                    <Text>{item.text}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>

      {/* Blog Detail Modal - giống Facebook */}
      <Modal
        open={isDetailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={null}
        width={1000}
        centered
        className="blog-detail-modal"
        bodyStyle={{ padding: 0, height: '80vh', overflow: 'hidden' }}
      >
        {selectedBlog && (
          <div className="blog-detail-container">
            <Row className="blog-detail-wrapper">
              {/* Left side - Blog content */}
              <Col xs={24} sm={24} md={16} className="blog-detail-content">
                <div className="blog-detail-header">
                  <div className="blog-detail-title">
                    <Title level={3}>{selectedBlog.blogTitle}</Title>
                  </div>
                  <div className="blog-detail-meta">
                    <Space split={<Divider type="vertical" />}>
                      <span>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <Text style={{ marginLeft: 8 }}>{selectedBlog.author}</Text>
                      </span>
                      <span>
                        <CalendarOutlined />
                        <Text style={{ marginLeft: 8 }}>{new Date(selectedBlog.createDate).toLocaleDateString()}</Text>
                      </span>
                      <span>
                        <Tag color="blue">{getCategoryLabel(selectedBlog.category)}</Tag>
                      </span>
                    </Space>
                  </div>
                </div>

                {selectedBlog.thumbnail && (
                  <div className="blog-detail-image">
                    <img src={selectedBlog.thumbnail} alt={selectedBlog.blogTitle} />
                  </div>
                )}

                <div className="blog-detail-text">
                  <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.8' }}>
                    {selectedBlog.blogContent}
                  </Paragraph>
                </div>

                <div className="blog-detail-footer">
                  <div className="blog-detail-tags">
                    {selectedBlog.tags && selectedBlog.tags.map(tag => (
                      <Tag 
                        key={tag} 
                        color="green" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handleTagClick(tag);
                          handleCloseDetailModal();
                        }}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  
                  <div className="blog-stats-bar">
                    <Space size="large">
                      <Tooltip title="Lượt xem">
                        <span className="stat-item">
                          <EyeOutlined /> {selectedBlog.views || 0}
                        </span>
                      </Tooltip>
                      
                      <Tooltip title={likedStates[selectedBlog._id] ? "Bỏ thích" : "Thích"}>
                        <span 
                          className={`stat-item like-button ${likedStates[selectedBlog._id] ? "liked" : ""}`}
                          onClick={() => toggleLike(selectedBlog._id)}
                        >
                          {likedStates[selectedBlog._id] ? <HeartFilled /> : <HeartOutlined />} {selectedBlog.likes || 0}
                        </span>
                      </Tooltip>
                      
                      <Tooltip title="Bình luận">
                        <span className="stat-item">
                          <CommentOutlined /> {selectedBlog.comments?.length || 0}
                        </span>
                      </Tooltip>
                      
                      <Tooltip title="Thời gian đọc">
                        <span className="stat-item">
                          <ClockCircleOutlined /> {selectedBlog.readingTime || 5} phút
                        </span>
                      </Tooltip>
                    </Space>
                  </div>
                </div>
              </Col>

              {/* Right side - Comments */}
              <Col xs={24} sm={24} md={8} className="blog-detail-comments">
                <div className="comments-header">
                  <Title level={4}>Bình luận ({selectedBlog.comments?.length || 0})</Title>
                </div>
                
                <div className="comments-list">
                  {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
                    <div className="comments-list-content">
                      {selectedBlog.comments.map((comment, index) => (
                        <div key={index} className="comment-item">
                          <div className="comment-author">
                            <Avatar icon={<UserOutlined />} />
                            <div className="comment-info">
                              <Text strong>Người dùng</Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </Text>
                            </div>
                          </div>
                          <div className="comment-content">
                            <div className="comment-bubble">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-comments">
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CommentOutlined style={{ fontSize: 24, opacity: 0.5 }} />
                        <Paragraph style={{ marginTop: 8 }}>Chưa có bình luận. Hãy là người đầu tiên bình luận!</Paragraph>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="comment-input">
                  <Form.Item style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex' }}>
                      <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                      <Input.TextArea
                        rows={2}
                        placeholder="Viết bình luận..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            handleCommentSubmit();
                          }
                        }}
                      />
                    </div>
                  </Form.Item>
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <Button 
                      type="primary" 
                      onClick={handleCommentSubmit} 
                      disabled={!commentContent.trim()}
                      loading={submittingComment}
                    >
                      Bình luận
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlogList;
