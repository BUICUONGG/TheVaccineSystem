import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import axiosInstance from '../../service/api';
import HeaderLayouts from '../layouts/header';
import FooterLayouts from '../layouts/footer';
import { Spin } from 'antd';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const [error, setError] = useState(null);
  const footerRef = useRef(null);

  useEffect(() => {
    // Set document title
    document.title = "Thanh toán thành công";

    // Get payment result from location state
    if (location.state?.paymentResult) {
      setPaymentResult(location.state.paymentResult);
      setLoading(false);
    } else {
      // If no payment result in state, try to get from URL params (for redirect from ZaloPay)
      const urlParams = new URLSearchParams(window.location.search);
      const appTransId = urlParams.get('apptransid');
      
      if (appTransId) {
        // Check payment status with backend
        checkPaymentStatus(appTransId);
      } else {
        // Try to get transaction info from localStorage
        const zalopayTransactionInfo = localStorage.getItem('zalopayTransactionInfo');
        if (zalopayTransactionInfo) {
          try {
            const transactionInfo = JSON.parse(zalopayTransactionInfo);
            checkPaymentStatus(transactionInfo.app_trans_id);
          } catch (e) {
            setError('Không thể xác minh thông tin thanh toán');
            setLoading(false);
          }
        } else {
          // If no info in localStorage, try to get basic payment data
          const pendingPayment = localStorage.getItem('pendingPayment');
          if (pendingPayment) {
            try {
              const paymentData = JSON.parse(pendingPayment);
              setPaymentResult({
                amount: paymentData.price,
                time: new Date().toISOString(),
                customerName: paymentData.customerName,
                vaccineName: paymentData.vaccineName,
                date: paymentData.date
              });
              setLoading(false);
            } catch (e) {
              setError('Không thể đọc thông tin thanh toán');
              setLoading(false);
            }
          } else {
            setError('Không tìm thấy thông tin thanh toán');
            setLoading(false);
          }
        }
      }
    }
    
    // Clean up localStorage when component mounts
    localStorage.removeItem('pendingPayment');
    localStorage.removeItem('zalopayTransactionInfo');
    
    // Start progress bar for navigation after successful payment
    if (!loading && !error) {
      setProgressActive(true);
      
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
    }
  }, [location, navigate, loading, error]);
  
  const checkPaymentStatus = async (appTransId) => {
    try {
      const response = await axiosInstance.post(`/zalopay/order-status/${appTransId}`);
      
      if (response.data.return_code === 1) {
        // Payment successful
        const pendingPayment = localStorage.getItem('pendingPayment');
        let additionalInfo = {};
        
        if (pendingPayment) {
          try {
            additionalInfo = JSON.parse(pendingPayment);
          } catch (e) {
            console.error('Error parsing pending payment:', e);
          }
        }
        
        setPaymentResult({
          app_trans_id: appTransId,
          amount: response.data.amount,
          time: new Date(parseInt(response.data.app_time)).toISOString(),
          status: 'Thành công',
          ...additionalInfo
        });
        
        // Start progress for navigation
        setProgressActive(true);
      } else {
        // Payment failed or pending
        setError(`Thanh toán không thành công: ${response.data.return_message}`);
      }
    } catch (error) {
      setError('Không thể kết nối đến máy chủ thanh toán');
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="payment-success-container">
          <div className="success-card">
            <h2>Đang xác thực thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát</p>
            <Spin size="large" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="payment-success-container error">
          <div className="success-card">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" width="90" height="90">
                <path
                  fill="#f44336"
                  d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Z"
                />
                <path
                  fill="#f44336"
                  d="M13.5,12l3.5,3.5-1.5,1.5-3.5-3.5-3.5,3.5-1.5-1.5,3.5-3.5-3.5-3.5,1.5-1.5,3.5,3.5,3.5-3.5,1.5,1.5Z"
                />
              </svg>
            </div>
            <h1>Thanh Toán Thất Bại</h1>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => navigate('/registerinjection')}
            >
              Quay lại đăng ký
            </button>
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
          <div className="redirect-progress">
            <div className={`redirect-progress-bar ${progressActive ? 'active' : ''}`}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="payment-success-page">
      <HeaderLayouts footerRef={footerRef} />
      <div className="payment-success-content">
        {renderContent()}
      </div>
      <div ref={footerRef}>
        <FooterLayouts />
      </div>
    </div>
  );
};

export default PaymentSuccess; 