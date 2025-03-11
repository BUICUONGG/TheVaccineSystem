import { useState, useEffect } from "react";
import { Card, Row, Col, Typography } from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./NewsList.css";
import axiosInstance from "../../service/api";

const { Title, Paragraph } = Typography;

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchNews();
    setVisible(true);
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/news/showNews", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      // Lọc chỉ hiển thị các news có trạng thái "active"
      const activeNews = response.data.filter(news => news.status === "active");
      const newsWithViews = activeNews.map((news) => ({
        ...news,
        views: 500,
      }));
      setNews(newsWithViews);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  return (
    <div className="news-container">
      <div className="back-home-wrapper">
        <Link to="/homepage" className="back-home">
          Back home
        </Link>
      </div>

      <Title level={1} className={`main-title ${visible ? "fade-in" : ""}`}>
        Tin Tức Vaccine
      </Title>

      <Row gutter={[16, 16]}>
        {news.map((newsItem, index) => (
          <Col span={8} key={newsItem._id}>
            <Card
              loading={loading}
              className={`fade-in-news`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <img
                src={newsItem.imageUrl || "./images/news1.png"}
                alt="news"
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <Title level={4}>{newsItem.newsTitle}</Title>
              <Paragraph>{newsItem.newsContent}</Paragraph>
              <div className="news-date">
                <CalendarOutlined /> {new Date(newsItem.createDate).toLocaleDateString()}
              </div>
              <div className="news-actions">
                <ShareAltOutlined />
                <span className="views-count">
                  <EyeOutlined /> {newsItem.views}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default NewsList;
