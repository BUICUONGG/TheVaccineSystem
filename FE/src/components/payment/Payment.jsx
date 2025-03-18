import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';
import axiosInstance from '../../service/api';
import { Spin, Button, Modal } from 'antd';
import { toast } from 'react-toastify';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  
  useEffect(() => {
    if (!location.state?.paymentData) {
      setError('Không có thông tin thanh toán');
      return;
    }
    
    setPaymentData(location.state.paymentData);
    processPayment(location.state.paymentData);
  }, [location.state]);
  
  const processPayment = async (data) => {
    setLoading(true);
    try {
      // Save payment information to localStorage before redirecting
      // This allows us to retrieve it when returning from ZaloPay
      localStorage.setItem('pendingPayment', JSON.stringify({
        vaccineName: data.vaccineName,
        customerName: data.customerName,
        price: data.price,
        type: data.type,
        date: data.appointmentData?.date || new Date().toLocaleDateString('vi-VN')
      }));
      
      const response = await axiosInstance.post('/zalopay/payment', data);
      
      if (response.data && response.data.order_url) {
        setPaymentUrl(response.data.order_url);
        // Auto redirect to ZaloPay payment page
        window.location.href = response.data.order_url;
      } else {
        setError('Không thể tạo đường dẫn thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data || 'Lỗi xử lý thanh toán');
      toast.error('Không thể xử lý thanh toán. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    Modal.confirm({
      title: 'Hủy thanh toán',
      content: 'Bạn có chắc chắn muốn hủy thanh toán này không?',
      okText: 'Có, hủy thanh toán',
      cancelText: 'Không, tiếp tục',
      onOk: () => {
        localStorage.removeItem('pendingPayment');
        navigate('/homepage');
      }
    });
  };
  
  if (loading) {
    return (
      <div className="payment-container">
        <h2>Đang xử lý thanh toán</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spin size="large" />
          <p style={{ marginTop: '1rem' }}>Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="payment-container error">
        <h2>Lỗi thanh toán</h2>
        <p>{error}</p>
        <div className="payment-actions">
          <Button type="primary" onClick={() => navigate('/registerinjection')}>
            Quay lại đăng ký
          </Button>
        </div>
      </div>
    );
  }
  
  if (!paymentData) {
    return (
      <div className="payment-container">
        <h2>Không có thông tin thanh toán</h2>
        <div className="payment-actions">
          <Button type="primary" onClick={() => navigate('/registerinjection')}>
            Quay lại đăng ký
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-container">
      <h2>Xác nhận thanh toán</h2>
      
      <div className="payment-details">
        <h3>Chi tiết đơn hàng</h3>
        <div className="detail-row">
          <span>Tên vaccine:</span>
          <span>{paymentData.vaccineName}</span>
        </div>
        <div className="detail-row">
          <span>Khách hàng:</span>
          <span>{paymentData.customerName}</span>
        </div>
        <div className="detail-row">
          <span>Số tiền:</span>
          <span>{Number(paymentData.price).toLocaleString('vi-VN')} VND</span>
        </div>
        {paymentData.appointmentData?.date && (
          <div className="detail-row">
            <span>Ngày đăng ký:</span>
            <span>{paymentData.appointmentData.date}</span>
          </div>
        )}
      </div>
      
      {paymentUrl && (
        <div className="payment-url">
          <p>Nếu bạn không được chuyển hướng tự động, vui lòng bấm vào đường dẫn dưới đây:</p>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
            Thanh toán qua ZaloPay
          </a>
        </div>
      )}
      
      <div className="payment-actions">
        <Button className="cancel-btn" onClick={handleCancel}>
          Hủy
        </Button>
        <Button 
          className="confirm-btn" 
          disabled={!paymentUrl}
          onClick={() => window.location.href = paymentUrl}
        >
          Xác nhận thanh toán
        </Button>
      </div>
    </div>
  );
};

export default Payment;