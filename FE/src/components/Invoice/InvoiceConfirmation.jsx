import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Divider, Spin } from 'antd';
import HeaderLayouts from '../../components/layouts/header';
import './InvoiceConfirmation.css';

const InvoiceConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.invoiceData) {
      setInvoiceData(location.state.invoiceData);
    } else {
      // Không có dữ liệu, quay về trang đăng ký
      navigate('/registerinjection', { state: { error: 'Không có thông tin đăng ký' } });
    }
  }, [location, navigate]);

  const handleProceedToPayment = () => {
    setLoading(true);
    // Chuyển đến trang thanh toán với dữ liệu paymentData
    navigate('/payment', { 
      state: { 
        paymentData: invoiceData.paymentData // Sử dụng dữ liệu thanh toán đã được chuẩn bị
      } 
    });
  };

  const handleCancel = () => {
    navigate('/registerinjection');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString;
  };

  if (!invoiceData) {
    return (
      <div className="invoice-container loading">
        <Spin size="large" />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <>
      <HeaderLayouts />
      <div className="invoice-container">
        <div className="invoice-card">
          <div className="invoice-header">
            <h1>Xác Nhận Hóa Đơn</h1>
            <p>Vui lòng kiểm tra thông tin đăng ký tiêm chủng của bạn</p>
          </div>

          <div className="invoice-content">
            <div className="invoice-section">
              <h2>Thông Tin Cá Nhân</h2>
              <div className="invoice-detail-row">
                <span className="label">Tên khách hàng:</span>
                <span className="value">{invoiceData.customerName}</span>
              </div>
              
              {invoiceData.appointmentData?.childInfo && (
                <>
                  <Divider className="section-divider" />
                  <h3>Thông Tin Trẻ Em</h3>
                  <div className="invoice-detail-row">
                    <span className="label">Tên trẻ:</span>
                    <span className="value">{invoiceData.appointmentData.childInfo.name}</span>
                  </div>
                  <div className="invoice-detail-row">
                    <span className="label">Ngày sinh:</span>
                    <span className="value">{invoiceData.appointmentData.childInfo.birthday}</span>
                  </div>
                  <div className="invoice-detail-row">
                    <span className="label">Giới tính:</span>
                    <span className="value">
                      {invoiceData.appointmentData.childInfo.gender === 'male' ? 'Nam' : 'Nữ'}
                    </span>
                  </div>
                  {invoiceData.appointmentData.childInfo.healthNote && (
                    <div className="invoice-detail-row">
                      <span className="label">Ghi chú sức khỏe:</span>
                      <span className="value">{invoiceData.appointmentData.childInfo.healthNote}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <Divider className="section-divider" />

            <div className="invoice-section">
              <h2>Thông Tin Vaccine</h2>
              <div className="invoice-detail-row">
                <span className="label">Loại:</span>
                <span className="value">
                  {invoiceData.type === 'aptLe' ? 'Vaccine Lẻ' : 'Gói Vaccine'}
                </span>
              </div>
              <div className="invoice-detail-row">
                <span className="label">Tên vaccine:</span>
                <span className="value">{invoiceData.vaccineName}</span>
              </div>
              <div className="invoice-detail-row highlight">
                <span className="label">Đơn giá:</span>
                <span className="value">{invoiceData.price?.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <Divider className="section-divider" />

            <div className="invoice-section">
              <h2>Thông Tin Lịch Hẹn</h2>
              <div className="invoice-detail-row">
                <span className="label">Ngày tiêm:</span>
                <span className="value">{formatDate(invoiceData.date)}</span>
              </div>
              <div className="invoice-detail-row">
                <span className="label">Thời gian:</span>
                <span className="value">{invoiceData.time || "Chưa xác định"}</span>
              </div>
              <div className="invoice-detail-row">
                <span className="label">Ngày đăng ký:</span>
                <span className="value">{formatDate(invoiceData.appointmentData?.createAt)}</span>
              </div>
            </div>

            <div className="invoice-total">
              <span className="total-label">Tổng thanh toán:</span>
              <span className="total-value">{invoiceData.price?.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          <div className="invoice-actions">
            <Button 
              className="cancel-btn" 
              onClick={handleCancel}
              disabled={loading}
            >
              Quay Lại
            </Button>
            <Button 
              className="confirm-btn"
              type="primary" 
              onClick={handleProceedToPayment}
              loading={loading}
            >
              Tiến Hành Thanh Toán
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceConfirmation; 