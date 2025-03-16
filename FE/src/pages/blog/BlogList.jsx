import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Tag, Space, Divider, Select, Input, Button, Tooltip, Spin, Avatar, List } from "antd";
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
      
      const response = await axiosInstance.get("/blogs/showBlog", {
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
      const response = await axiosInstance.get("/blogs/tags/popular", {
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
      await axiosInstance.post(`/blogs/like/${blogId}`, {}, {
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
      const response = await axiosInstance.post(`/blogs/incrementViews/${blogId}`, {}, {
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
  const handleViewBlogDetail = (blogId, slug) => {
    // Tăng lượt xem
    incrementViews(blogId);
    
    // Chuyển hướng đến trang chi tiết bài viết sẽ được xử lý bởi Link component
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
    >
      <Row gutter={[16, 0]}>
        {blog.thumbnail && (
          <Col xs={24} sm={6} md={4} lg={4}>
            <div className="blog-thumbnail">
              <Link to={`/blog/${createSafeSlug(blog.blogTitle)}`} onClick={() => incrementViews(blog._id)}>
                <img 
                  src={blog.thumbnail || "./images/blog1.png"} 
                  alt={blog.blogTitle}
                />
              </Link>
            </div>
          </Col>
        )}
        
        <Col xs={24} sm={blog.thumbnail ? 18 : 24} md={blog.thumbnail ? 20 : 24} lg={blog.thumbnail ? 20 : 24}>
          <div className="blog-content">
            <Link to={`/blog/${createSafeSlug(blog.blogTitle)}`} onClick={() => incrementViews(blog._id)}>
              <Title level={4} className="blog-title">{blog.blogTitle}</Title>
            </Link>
            
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
            
            {/* Thêm nút xem chi tiết */}
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Link to={`/blog/${createSafeSlug(blog.blogTitle)}`} onClick={() => incrementViews(blog._id)}>
                <Button type="primary" size="small">Xem chi tiết</Button>
              </Link>
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
    </div>
  );
};

export default BlogList;
