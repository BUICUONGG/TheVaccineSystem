import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Empty, Button, message, Divider, Tag, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, CalendarOutlined, FilterOutlined } from '@ant-design/icons';
import axiosInstance from '../../service/api';
import './NewsList.css';

const { Title, Text, Paragraph } = Typography;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Category mapping
  const categoryMap = {
    'all': 'Tất cả tin tức',
    'tin-tuc-suc-khoe': 'Tin tức sức khoẻ',
    'hoat-dong': 'Hoạt động VNVC toàn quốc',
    'tu-van': 'Tư vấn kiến thức sức khoẻ',
    'general': 'Tin tức chung'
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredNews(news);
    } else {
      const filtered = news.filter(item => item.category === selectedCategory);
      setFilteredNews(filtered);
    }
  }, [selectedCategory, news]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/news/getAllNews');
      console.log('API response:', response.data);
      
      if (response.data && response.data.result) {
        setNews(response.data.result);
        setFilteredNews(response.data.result);
      } else {
        setNews([]);
        setFilteredNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      message.error('Không thể tải dữ liệu tin tức');
      setNews([]);
      setFilteredNews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const getCategoryName = (category) => {
    return categoryMap[category] || category || 'Không xác định';
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="news-container">
      <div className="news-header">
        <Button
          className="back-home-button"
          type="primary"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
        >
          Quay về trang chủ
        </Button>
        <Title level={2} className="news-title">TIN TỨC</Title>
      </div>

      <div className="category-filter">
        <Space wrap>
          {Object.entries(categoryMap).map(([key, value]) => (
            <Button
              key={key}
              type={selectedCategory === key ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(key)}
              icon={<FilterOutlined />}
            >
              {value}
            </Button>
          ))}
        </Space>
      </div>

      <Divider />

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : !Array.isArray(filteredNews) || filteredNews.length === 0 ? (
        <Empty description="Không có tin tức nào" />
      ) : (
        <div>
          {/* Featured/Latest News */}
          <div className="featured-news">
            {filteredNews.slice(0, 1).map(item => (
              <Card key={item._id} hoverable>
                <div className="featured-news-container">
                  <div className="featured-news-image">
                    {item.imageUrl ? (
                      <>
                        <img
                          alt={item.newsTitle}
                          src={item.imageUrl}
                        />
                        <img
                          src="../images/LogoHeader.png"
                          alt="VNVC Logo"
                          className="news-logo-overlay"
                        />
                      </>
                    ) : (
                      <div className="news-card-placeholder">
                        <Text type="secondary">Không có hình ảnh</Text>
                      </div>
                    )}
                  </div>
                  <div className="featured-news-content">
                    <div>
                      <Tag color="blue">{getCategoryName(item.category)}</Tag>
                    </div>
                    <Link to={`/news/detail/${item._id}`}>
                      <Title level={2} className="featured-news-title">
                        {item.newsTitle}
                      </Title>
                    </Link>
                    <Paragraph className="featured-news-description">
                      {truncateText(item.newsContent, 300)}
                    </Paragraph>
                    <div className="news-card-meta">
                      <Text type="secondary">
                        <CalendarOutlined style={{ marginRight: '5px' }} />
                        {formatDate(item.createDate)}
                      </Text>
                    </div>
                    <div className="news-card-action">
                      <Link to={`/news/detail/${item._id}`}>
                        <Button type="link">Xem chi tiết</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Regular News Grid */}
          <div className="news-grid">
            {filteredNews.slice(1).map(item => (
              <Card
                key={item._id}
                hoverable
                cover={
                  item.imageUrl ? (
                    <div className="news-card-image-container">
                      <img
                        alt={item.newsTitle}
                        src={item.imageUrl}
                        className="news-card-image"
                      />
                      <img
                        src="../images/LogoHeader.png"
                        alt="VNVC Logo"
                        className="news-logo-overlay"
                      />
                    </div>
                  ) : (
                    <div className="news-card-placeholder">
                      <Text type="secondary">Không có hình ảnh</Text>
                    </div>
                  )
                }
              >
                <div>
                  <Tag color="blue">{getCategoryName(item.category)}</Tag>
                </div>
                <Link to={`/news/detail/${item._id}`}>
                  <Title level={4} className="news-card-title">{item.newsTitle}</Title>
                </Link>
                <div className="news-card-meta">
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: '5px' }} />
                    {formatDate(item.createDate)}
                  </Text>
                </div>
                <div className="news-card-action">
                  <Link to={`/news/detail/${item._id}`}>
                    <Button type="link">Xem chi tiết</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;
