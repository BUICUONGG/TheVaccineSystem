import React, { useState, useEffect } from "react";
import { Rate, Input, Button, Modal, message } from "antd";
import axiosInstance from "../../service/api";
import "./FeedbackForm.css";

const { TextArea } = Input;

const FeedbackForm = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setRating(5);
      setComment("");
    }
  }, [isOpen]);

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
        onClose();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      message.error("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
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
    </Modal>
  );
};

export default FeedbackForm; 