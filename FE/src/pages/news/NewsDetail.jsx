import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Typography, Spin, Button, Tag, Divider, message } from 'antd';
import { HomeOutlined, CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axiosInstance from '../../service/api';
import './NewsDetail.css';

const { Title, Text, Paragraph } = Typography;

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    // Category mapping
    const categoryMap = {
        'tin-tuc-suc-khoe': 'Tin tức sức khoẻ',
        'hoat-dong': 'Hoạt động VNVC toàn quốc',
        'tu-van': 'Tư vấn kiến thức sức khoẻ',
        'general': 'Tin tức chung'
    };

    useEffect(() => {
        fetchNewsDetail();
        // Increment view count
        incrementViewCount();
    }, [id]);

    const fetchNewsDetail = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/news/detail/${id}`);
            console.log('API Response:', response.data); // Debug log
            
            // Kiểm tra nếu response.data tồn tại (không cần kiểm tra .result)
            if (response.data) {
                setNews(response.data);
            } else {
                message.error('Không tìm thấy thông tin tin tức');
            }
        } catch (error) {
            console.error('Error fetching news detail:', error);
            message.error('Không thể tải thông tin tin tức');
        } finally {
            setLoading(false);
        }
    };

    const incrementViewCount = async () => {
        try {
            await axiosInstance.post(`/news/view/${id}`);
        } catch (error) {
            console.error('Error incrementing view count:', error);
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

    if (loading) {
        return (
            <div className="news-detail-loading">
                <Spin size="large" />
                <p>Đang tải thông tin tin tức...</p>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="news-detail-error">
                <p>Không tìm thấy tin tức</p>
                <Button type="primary" onClick={() => navigate('/news')}>
                    Quay lại danh sách tin tức
                </Button>
            </div>
        );
    }

    return (
        <div className="news-detail-container">
            <div className="news-detail-header">
                <div className="news-detail-navigation">
                    <Button 
                        icon={<HomeOutlined />} 
                        onClick={() => navigate('/')}
                    >
                        Trang chủ
                    </Button>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/news')}
                    >
                        Danh sách tin tức
                    </Button>
                </div>
            </div>

            <div className="news-detail-content">
                <div className="news-detail-meta">
                    <Tag color="blue">{getCategoryName(news.category)}</Tag>
                </div>

                <Title level={2} className="news-detail-title">{news.newsTitle}</Title>
                <div className="news-detail-author">
                    Đăng bởi Admin | {formatDate(news.createDate)} | {news.viewCount || 0} lượt xem
                </div>

                {news.imageUrl && (
                    <div className="news-detail-image">
                        <img src={news.imageUrl} alt={news.newsTitle} />
                    </div>
                )}

                <Divider />

                <div className="news-detail-text">
                <Title level={3} className="news-detail-title">{news.newsTitle}</Title>
                    <Paragraph>{news.newsContent}</Paragraph>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
