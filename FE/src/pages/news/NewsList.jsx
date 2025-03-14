import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Spin, Pagination, Input, Empty, Breadcrumb } from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import "./NewsList.css";
import axiosInstance from "../../service/api";
import NewsNavigation from "../../components/NewsNavigation";

const { Title, Paragraph } = Typography;
const { Search } = Input;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current page from URL query params
  const queryParams = new URLSearchParams(location.search);
  const page = parseInt(queryParams.get('page')) || 1;
  
  useEffect(() => {
    if (category) {
      fetchNewsByCategory(category, page);
    } else if (searchQuery) {
      searchNews(searchQuery, page);
    } else {
      fetchAllNews(page);
    }
  }, [category, page, searchQuery]);

  const fetchAllNews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/news?page=${page}&limit=${pagination.pageSize}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      setNews(response.data.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.data.pagination.total
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setLoading(false);
    }
  };
  
  const fetchNewsByCategory = async (category, page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/news/category/${category}?page=${page}&limit=${pagination.pageSize}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      setNews(response.data.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.data.pagination.total
      });
      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch ${category} news:`, error);
      setLoading(false);
    }
  };
  
  const searchNews = async (query, page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/news/search?q=${query}&page=${page}&limit=${pagination.pageSize}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      
      setNews(response.data.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.data.pagination.total
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to search news:", error);
      setLoading(false);
    }
  };
  
  const handlePageChange = (page) => {
    // Update URL with new page parameter
    navigate(`${location.pathname}?page=${page}`);
  };
  
  const handleSearch = (value) => {
    setSearchQuery(value);
    // Reset to page 1 when searching
    navigate(`/news?page=1&search=${value}`);
  };
  
  const incrementViewCount = async (id) => {
    try {
      await axiosInstance.post(`/news/view/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };
  
  const getCategoryName = () => {
    if (!category) return "Tất cả tin tức";
    
    const categoryMap = {
      'uu-dai': 'Ưu đãi hấp dẫn',
      'tin-tuc-suc-khoe': 'Tin tức sức khoẻ',
      'hoat-dong': 'Hoạt động VNVC toàn quốc',
      'khai-truong': 'Khai trương VNVC toàn quốc',
      'livestream': 'Livestream tư vấn',
      'tu-van': 'Tư vấn kiến thức sức khoẻ',
      'cuoc-thi': 'Cuộc thi và sự kiện',
      'doi-tac': 'Đối tác và hợp tác'
    };
    
    return categoryMap[category] || 'Tin tức';
  };

  return (
    <div className="news-container">
      <div className="news-header">
        <Breadcrumb className="news-breadcrumb">
          <Breadcrumb.Item>
            <Link to="/homepage"><HomeOutlined /> Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/news">Tin tức</Link>
          </Breadcrumb.Item>
          {category && (
            <Breadcrumb.Item>{getCategoryName()}</Breadcrumb.Item>
          )}
        </Breadcrumb>
        
        <Search
          placeholder="Tìm kiếm tin tức"
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          className="news-search"
        />
      </div>

      <div className="news-content">
        <Row gutter={24}>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <div className="news-sidebar">
              <div className="news-category-title">Danh mục tin tức</div>
              <NewsNavigation />
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={18} lg={18} xl={18}>
            <div className="news-main">
              <Title level={2} className="news-section-title">
                {searchQuery ? `Kết quả tìm kiếm: ${searchQuery}` : getCategoryName()}
              </Title>
              
              {loading ? (
                <div className="news-loading">
                  <Spin size="large" />
                </div>
              ) : news.length === 0 ? (
                <Empty description="Không tìm thấy tin tức nào" />
              ) : (
                <>
                  <Row gutter={[24, 24]}>
                    {news.map((newsItem) => (
                      <Col xs={24} sm={12} md={8} key={newsItem._id}>
                        <Link 
                          to={`/news/detail/${newsItem._id}`}
                          onClick={() => incrementViewCount(newsItem._id)}
                        >
                          <Card 
                            hoverable
                            className="news-card"
                            cover={
                              <img
                                alt={newsItem.newsTitle}
                                src={newsItem.imageUrl || "/images/news/default.jpg"}
                                className="news-card-image"
                              />
                            }
                          >
                            <div className="news-card-category">{newsItem.categoryName}</div>
                            <Title level={4} className="news-card-title">{newsItem.newsTitle}</Title>
                            <Paragraph ellipsis={{ rows: 3 }} className="news-card-summary">
                              {newsItem.summary || newsItem.newsContent.substring(0, 150) + '...'}
                            </Paragraph>
                            <div className="news-card-meta">
                              <span className="news-card-date">
                                <CalendarOutlined /> {new Date(newsItem.createDate).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="news-card-views">
                                <EyeOutlined /> {newsItem.viewCount || 0}
                              </span>
                            </div>
                          </Card>
                        </Link>
                      </Col>
                    ))}
                  </Row>
                  
                  <div className="news-pagination">
                    <Pagination
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                    />
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NewsList;
