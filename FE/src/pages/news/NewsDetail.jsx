import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Row, 
  Col, 
  Typography, 
  Breadcrumb, 
  Spin, 
  Card, 
  Divider, 
  Tag, 
  Button, 
  Empty 
} from "antd";
import { 
  HomeOutlined, 
  CalendarOutlined, 
  EyeOutlined, 
  TagOutlined,
  LeftOutlined
} from "@ant-design/icons";
import axiosInstance from "../../service/api";
import NewsNavigation from "../../components/NewsNavigation";
import "./NewsDetail.css";

const { Title, Paragraph } = Typography;

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        // Fetch news details
        const response = await axiosInstance.get(`/news/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        });
        
        setNews(response.data);
        
        // Increment view count
        await axiosInstance.post(`/news/view/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        });
        
        // Fetch related news
        const relatedResponse = await axiosInstance.get(`/news/related/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        });
        
        setRelatedNews(relatedResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch news details:", error);
        setError("Không thể tải thông tin tin tức. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsDetail();
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="news-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="news-detail-error">
        <Empty 
          description={error || "Không tìm thấy tin tức"} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button type="primary" onClick={handleGoBack}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      <div className="news-detail-header">
        <Breadcrumb className="news-detail-breadcrumb">
          <Breadcrumb.Item>
            <Link to="/homepage"><HomeOutlined /> Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/news">Tin tức</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/news/category/${news.category}`}>{news.categoryName}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{news.newsTitle}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="news-detail-content">
        <Row gutter={24}>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <div className="news-detail-sidebar">
              <Button 
                type="primary" 
                icon={<LeftOutlined />} 
                onClick={handleGoBack}
                className="news-detail-back-button"
              >
                Quay lại
              </Button>
              
              <div className="news-category-title">Danh mục tin tức</div>
              <NewsNavigation />
              
              {relatedNews.length > 0 && (
                <div className="news-detail-related">
                  <div className="news-category-title">Tin liên quan</div>
                  <div className="news-detail-related-list">
                    {relatedNews.map(item => (
                      <Link 
                        to={`/news/detail/${item._id}`} 
                        key={item._id}
                        className="news-detail-related-item"
                      >
                        <div className="news-detail-related-image">
                          <img 
                            src={item.imageUrl || "/images/news/default.jpg"} 
                            alt={item.newsTitle} 
                          />
                        </div>
                        <div className="news-detail-related-title">
                          {item.newsTitle}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={18} lg={18} xl={18}>
            <div className="news-detail-main">
              <div className="news-detail-meta">
                <span className="news-detail-category">{news.categoryName}</span>
                <span className="news-detail-date">
                  <CalendarOutlined /> {new Date(news.createDate).toLocaleDateString('vi-VN')}
                </span>
                <span className="news-detail-views">
                  <EyeOutlined /> {news.viewCount || 0} lượt xem
                </span>
              </div>
              
              <Title level={1} className="news-detail-title">
                {news.newsTitle}
              </Title>
              
              {news.summary && (
                <Paragraph className="news-detail-summary">
                  {news.summary}
                </Paragraph>
              )}
              
              {news.imageUrl && (
                <div className="news-detail-featured-image">
                  <img 
                    src={news.imageUrl} 
                    alt={news.newsTitle} 
                  />
                </div>
              )}
              
              <div className="news-detail-body">
                {/* Render content with proper formatting */}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {news.newsContent}
                </div>
              </div>
              
              {news.tags && news.tags.length > 0 && (
                <div className="news-detail-tags">
                  <TagOutlined /> Tags: 
                  {news.tags.map(tag => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NewsDetail; 