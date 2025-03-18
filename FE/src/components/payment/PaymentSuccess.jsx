import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import axiosInstance from '../../service/api';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Get payment result from location state
    if (location.state?.paymentResult) {
      setPaymentResult(location.state.paymentResult);
    } else {
      // If no payment result in state, try to get from URL params (for redirect from ZaloPay)
      const urlParams = new URLSearchParams(window.location.search);
      const appTransId = urlParams.get('apptransid');
      
      if (appTransId) {
        setLoading(true);
        // Check payment status with backend
        checkPaymentStatus(appTransId);
      } else {
        // If no apptransid in URL, try to get payment data from localStorage
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (pendingPayment) {
          try {
            const paymentData = JSON.parse(pendingPayment);
            setPaymentResult({
              amount: paymentData.price,
              time: new Date().toISOString(),
              // Use the data from localStorage
              customerName: paymentData.customerName,
              vaccineName: paymentData.vaccineName,
              date: paymentData.date
            });
          } catch (e) {
            console.error('Error parsing payment data:', e);
          }
        }
      }
    }
    
    // Clean up localStorage when component mounts
    localStorage.removeItem('pendingPayment');
    
    // Start fade out after 4 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Navigate after fade out (5 seconds total)
    const navigationTimer = setTimeout(() => {
      navigate('/profile/history');
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigationTimer);
    };
  }, [location, navigate]);
  
  const checkPaymentStatus = async (appTransId) => {
    try {
      const response = await axiosInstance.post(`/zalopay/order-status/${appTransId}`);
      setLoading(false);
      
      if (response.data.return_code === 1) {
        // Payment successful
        setPaymentResult({
          app_trans_id: appTransId,
          amount: response.data.amount,
          time: new Date(parseInt(response.data.app_time)).toISOString(),
          // Try to get more details from localStorage
          ...getPaymentDetailsFromLocalStorage()
        });
      } else {
        // Payment failed or pending
        navigate('/payment', { 
          state: { 
            error: `Thanh toán không thành công: ${response.data.return_message}` 
          } 
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error checking payment status:', error);
    }
  };
  
  const getPaymentDetailsFromLocalStorage = () => {
    try {
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        return JSON.parse(pendingPayment);
      }
    } catch (e) {
      console.error('Error getting payment details from localStorage:', e);
    }
    return {};
  };

  if (loading) {
    return (
      <div className="payment-success-container">
        <div className="success-card">
          <h2>Đang xác thực thanh toán...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-success-container ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" width="90" height="90">
            <path
              fill="#4CAF50"
              d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Z"
            />
            <path
              fill="#4CAF50"
              d="M10.5,16.5,6,12l1.4-1.4,3.1,3.1,6.1-6.1L18,9Z"
            />
          </svg>
        </div>
        
        <h1>Thanh Toán Thành Công!</h1>
        <p>Thanh toán của bạn đã được xử lý thành công.</p>
        
        {paymentResult && (
          <div className="transaction-details">
            <h3>Chi Tiết Giao Dịch</h3>
            {paymentResult.app_trans_id && (
              <div className="detail-item">
                <span>Mã giao dịch:</span>
                <span>{paymentResult.app_trans_id}</span>
              </div>
            )}
            {paymentResult.vaccineName && (
              <div className="detail-item">
                <span>Vaccine:</span>
                <span>{paymentResult.vaccineName}</span>
              </div>
            )}
            {paymentResult.amount && (
              <div className="detail-item">
                <span>Số tiền:</span>
                <span>{Number(paymentResult.amount).toLocaleString('vi-VN')} VND</span>
              </div>
            )}
            {paymentResult.date && (
              <div className="detail-item">
                <span>Ngày tiêm:</span>
                <span>{paymentResult.date}</span>
              </div>
            )}
            {paymentResult.time && (
              <div className="detail-item">
                <span>Thời gian thanh toán:</span>
                <span>{new Date(paymentResult.time).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>
        )}
        
        <p>Đang chuyển hướng đến trang lịch hẹn của bạn...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 