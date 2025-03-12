import React, { useState, useEffect } from "react";
import { Table, Rate, Card, Statistic, Row, Col, Input, Button, Popconfirm, message, Tag, Tooltip, Modal } from "antd";
import { DeleteOutlined, SearchOutlined, UserOutlined, StarOutlined, CommentOutlined, CalendarOutlined } from "@ant-design/icons";
import axiosInstance from "../../../service/api";
import "./FeedbackManagement.css";

const { Search } = Input;

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStars: 0,
  });

  // Fetch all feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      
      // 1. Fetch all feedbacks
      const response = await axiosInstance.get("/feedback/getAllFeedback", {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      
      if (response.status === 200) {
        // Sort feedbacks by date (newest first)
        const sortedFeedbacks = response.data.sort((a, b) => 
          new Date(b.createAt) - new Date(a.createAt)
        );
        
        // 2. Fetch all customers to have a complete list
        const customersResponse = await axiosInstance.get("/customer/getAllCustomer", {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        });
        
        let customersData = [];
        if (customersResponse.data && customersResponse.data.result) {
          customersData = customersResponse.data.result;
        }
        
        // 3. Map customer data to feedbacks
        const feedbacksWithCustomerDetails = sortedFeedbacks.map(feedback => {
          // Find the customer that matches the feedback's cusId
          const customer = customersData.find(c => c._id === feedback.cusId);
          
          return {
            ...feedback,
            customerName: customer ? customer.customerName || customer.username || "Unknown" : "Unknown",
            customerEmail: customer ? customer.email || "N/A" : "N/A",
            customerPhone: customer ? customer.phone || "N/A" : "N/A",
          };
        });

        setFeedbacks(feedbacksWithCustomerDetails);
        setFilteredFeedbacks(feedbacksWithCustomerDetails);
        calculateStats(feedbacksWithCustomerDetails);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      message.error("Không thể tải dữ liệu đánh giá");
      
      if (error.response?.status === 401) {
        Modal.error({
          content: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from feedbacks
  const calculateStats = (feedbackData) => {
    const total = feedbackData.length;
    const ratingSum = feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = total > 0 ? (ratingSum / total).toFixed(1) : 0;
    
    // Count ratings by star level
    const ratingCounts = {
      5: feedbackData.filter(f => f.rating === 5).length,
      4: feedbackData.filter(f => f.rating === 4).length,
      3: feedbackData.filter(f => f.rating === 3).length,
      2: feedbackData.filter(f => f.rating === 2).length,
      1: feedbackData.filter(f => f.rating === 1).length,
    };
    
    setStats({
      total,
      averageRating,
      fiveStars: ratingCounts[5],
      fourStars: ratingCounts[4],
      threeStars: ratingCounts[3],
      twoStars: ratingCounts[2],
      oneStars: ratingCounts[1],
    });
  };

  // Delete feedback
  const handleDelete = async (id) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      const response = await axiosInstance.post(`/feedback/deleteFeedback/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      
      if (response.status === 200) {
        message.success("Xóa đánh giá thành công");
        fetchFeedbacks(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      message.error("Không thể xóa đánh giá");
      
      if (error.response?.status === 401) {
        Modal.error({
          content: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        });
      }
    }
  };

  // Search feedbacks
  const handleSearch = (value) => {
    setSearchText(value);
    
    if (!value) {
      setFilteredFeedbacks(feedbacks);
      return;
    }
    
    const filtered = feedbacks.filter(
      feedback => 
        (feedback.customerName && feedback.customerName.toLowerCase().includes(value.toLowerCase())) ||
        (feedback.customerEmail && feedback.customerEmail.toLowerCase().includes(value.toLowerCase())) ||
        (feedback.customerPhone && feedback.customerPhone.toLowerCase().includes(value.toLowerCase())) ||
        (feedback.comment && feedback.comment.toLowerCase().includes(value.toLowerCase()))
    );
    
    setFilteredFeedbacks(filtered);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Table columns
  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <Tooltip title={`Email: ${record.customerEmail || 'N/A'}, SĐT: ${record.customerPhone || 'N/A'}`}>
          <span><UserOutlined /> {text || "Chưa cập nhật"}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => text || <Tag color="default">Không có bình luận</Tag>,
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      sorter: (a, b) => new Date(b.createAt) - new Date(a.createAt),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Xóa đánh giá này?"
          description="Bạn có chắc chắn muốn xóa đánh giá này không?"
          onConfirm={() => handleDelete(record._id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="feedback-management">
      <h1 className="page-title">Quản lý đánh giá khách hàng</h1>
      
      {/* Statistics Cards */}
      <div className="stats-container">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Tổng số đánh giá" 
                value={stats.total} 
                prefix={<CommentOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card rating-card">
              <Statistic 
                title="Đánh giá trung bình" 
                value={stats.averageRating} 
                suffix={<StarOutlined />} 
                precision={1}
              />
              <Rate disabled allowHalf value={parseFloat(stats.averageRating)} className="average-rate" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Đánh giá 5 sao" 
                value={stats.fiveStars} 
                suffix={<span>/ {stats.total}</span>} 
              />
              <div className="star-percentage">
                {stats.total > 0 ? ((stats.fiveStars / stats.total) * 100).toFixed(1) : 0}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="stat-card">
              <Statistic 
                title="Đánh giá gần đây" 
                value={feedbacks.length > 0 ? new Date(feedbacks[0].createAt).toLocaleDateString('vi-VN') : 'N/A'} 
                prefix={<CalendarOutlined />} 
              />
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Search Bar */}
      <div className="search-container">
        <Search
          placeholder="Tìm kiếm theo tên khách hàng, email, số điện thoại hoặc nội dung bình luận"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          className="search-input"
        />
      </div>
      
      {/* Feedback Table */}
      <Table
        columns={columns}
        dataSource={filteredFeedbacks}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`,
        }}
        className="feedback-table"
      />
    </div>
  );
};

export default FeedbackManagement; 