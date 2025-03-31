import React, { useState, useEffect } from "react";
import { Rate, Input, Button, Modal, message, Alert, Spin } from "antd";
import axiosInstance from "../../service/api";
import "./FeedbackForm.css";

const { TextArea } = Input;

const FeedbackForm = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [checkingFeedback, setCheckingFeedback] = useState(true);

  useEffect(() => {
    // Reset form when modal opens and check for existing feedback
    if (isOpen) {
      checkForExistingFeedback();
    }
  }, [isOpen]);

  const checkForExistingFeedback = async () => {
    try {
      setCheckingFeedback(true);
      // Get customer ID from localStorage
      const cusId = localStorage.getItem("cusId");
      
      if (!cusId) {
        setCheckingFeedback(false);
        return;
      }

      // Check if user already has a feedback
      const response = await axiosInstance.get(`/feedback/getFeedbackByCusId/${cusId}`);
      
      if (response.data) {
        // User already has a feedback, show it
        setExistingFeedback(response.data);
        setRating(response.data.rating);
        setComment(response.data.comment || "");
      } else {
        // User doesn't have a feedback yet, reset form
        setExistingFeedback(null);
        setRating(5);
        setComment("");
      }
    } catch (error) {
      console.error("Error checking existing feedback:", error);
      // Reset the form in case of error
      setExistingFeedback(null);
      setRating(5);
      setComment("");
    } finally {
      setCheckingFeedback(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Get customer ID from localStorage
      const cusId = localStorage.getItem("cusId");
      
      if (!cusId) {
        message.error("Bạn cần đăng nhập để gửi đánh giá");
        onClose();
        return;
      }

      // Create feedback data
      const feedbackData = {
        cusId,
        rating,
        comment,
        createAt: new Date().toISOString(),
      };

      // Send feedback to server
      const response = await axiosInstance.post("/feedback/createFeedback", feedbackData);
      
      if (response.status === 200) {
        message.success("Cảm ơn bạn đã gửi đánh giá!");
        // Set the new feedback as existing feedback so the user can see it
        setExistingFeedback(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error(error.response?.data || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đánh giá dịch vụ"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
    >
      {checkingFeedback ? (
        <div className="feedback-loading">
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang kiểm tra...</p>
        </div>
      ) : existingFeedback ? (
        <div className="feedback-form existing-feedback">
          <Alert
            message="Bạn đã gửi đánh giá trước đó"
            description="Mỗi khách hàng chỉ được gửi một đánh giá. Dưới đây là đánh giá bạn đã gửi."
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          
          <div className="feedback-rating">
            <h3>Đánh giá của bạn</h3>
            <Rate 
              disabled
              allowHalf 
              value={rating} 
              className="rating-stars"
            />
            <p className="feedback-date">
              Đánh giá vào: {new Date(existingFeedback.createAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="feedback-comment">
            <h3>Ý kiến của bạn</h3>
            <TextArea
              rows={4}
              value={comment || "Không có bình luận"}
              disabled
            />
          </div>

          <div className="feedback-actions">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      ) : (
        <div className="feedback-form">
          <div className="feedback-rating">
            <h3>Bạn đánh giá dịch vụ của chúng tôi như thế nào?</h3>
            <Rate 
              allowHalf 
              value={rating} 
              onChange={setRating} 
              className="rating-stars"
            />
          </div>
          
          <div className="feedback-comment">
            <h3>Ý kiến của bạn</h3>
            <TextArea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn với chúng tôi..."
            />
          </div>

          <div className="feedback-actions">
            <Button onClick={onClose}>Hủy</Button>
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={loading}
              disabled={!rating}
            >
              Gửi đánh giá
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FeedbackForm; 