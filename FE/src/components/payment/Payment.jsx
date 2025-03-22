import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import axiosInstance from "../../service/api";
import { Button, Modal, Radio, Input, Space, Divider, Spin } from "antd";
import { toast } from "react-toastify";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [, setPaymentUrl] = useState("");
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // useEffect(() => {
  //   document.title = "Xác nhận thanh toán";

  //   // Get data directly from registerInjection
  //   if (!location.state?.invoiceData) {
  //     setError("Không có thông tin thanh toán");
  //     setLoading(false);
  //     return;
  //   }

  //   const invoiceData = location.state.invoiceData;

  //   // Prepare payment data from invoice data
  //   const data = {
  //     cusId: invoiceData.cusId,
  //     vaccineId:
  //       invoiceData.type === "aptLe" ? invoiceData.vaccineId : undefined,
  //     vaccinePackageId:
  //       invoiceData.type === "aptGoi"
  //         ? invoiceData.vaccinePackageId
  //         : undefined,
  //     childId: invoiceData.childInfo ? "new" : undefined, // If has childInfo, we're creating a new child
  //     price: invoiceData.price,
  //     type: invoiceData.type, // aptLe or aptGoi
  //     date: invoiceData.date,
  //     time: invoiceData.time,
  //     childInfo: invoiceData.childInfo,
  //     note: invoiceData.note || "",
  //   };

  //   setPaymentData({
  //     ...data,
  //     vaccineName: invoiceData.vaccineName,
  //     customerName: invoiceData.customerName,
  //     // Lưu thông tin ngày và thời gian vào appointmentData cho việc hiển thị
  //     appointmentData: {
  //       date: invoiceData.date,
  //       time: invoiceData.time,
  //       childInfo: invoiceData.childInfo,
  //       createAt:
  //         invoiceData.createdAt || new Date().toLocaleDateString("vi-VN"),
  //     },
  //   });

  //   setLoading(false);
  // }, [location.state]);

  useEffect(() => {
    document.title = "Xác nhận thanh toán";

    if (!location.state?.invoiceData) {
      setError("Không có thông tin thanh toán");
      setLoading(false);
      return;
    }

    const invoiceData = location.state.invoiceData;

    // Prepare payment data from invoice data
    const data = {
      cusId: invoiceData.cusId,
      childId: "", // Để trống theo yêu cầu API
      price: invoiceData.price,
      type: invoiceData.type,
      date: invoiceData.date,
      time: invoiceData.time,
      status: "pending",
      note: `Lịch tiêm ${invoiceData.type === "aptLe" ? "vaccine" : "gói"} ${invoiceData.vaccineName}`
    };

    // Thêm thông tin trẻ nếu đăng ký cho trẻ
    if (invoiceData.childInfo) {
      data.childInfo = {
        name: invoiceData.childInfo.name,
        birthday: invoiceData.childInfo.birthday,
        gender: invoiceData.childInfo.gender,
        healthNote: invoiceData.childInfo.healthNote || ""
      };
    }

    // Thêm vaccineId hoặc vaccinePackageId tùy theo type
    if (invoiceData.type === "aptLe") {
      data.vaccineId = invoiceData.vaccineId;
    } else if (invoiceData.type === "aptGoi") {
      data.vaccinePackageId = invoiceData.vaccinePackageId;
    }

    setPaymentData({
      ...data,
      customerName: invoiceData.customerName,
      vaccineName: invoiceData.vaccineName,
      appointmentData: {
        date: invoiceData.date,
        time: invoiceData.time,
        childInfo: invoiceData.childInfo,
        createAt: invoiceData.createdAt || new Date().toLocaleDateString("vi-VN"),
      }
    });

    console.log("Payment Data:", data); // Để debug

    setLoading(false);
  }, [location.state]);

  const processPayment = async () => {
    setProcessingPayment(true);
    try {
      if (!paymentData) {
        throw new Error("Không có dữ liệu thanh toán");
      }

      // Save payment info to localStorage before redirecting
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({
          cusId: paymentData.cusId,
          vaccineId: paymentData.vaccineId,
          vaccinePackageId: paymentData.vaccinePackageId,
          date: paymentData.date,
          time: paymentData.time,
          type: paymentData.type, // aptLe or aptGoi
          price: paymentData.price,
          customerName: paymentData.customerName,
          vaccineName: paymentData.vaccineName,
        })
      );

      // Make API request to create payment
      const response = await axiosInstance.post(
        "/zalopay/payment",
        paymentData
      );

      if (response.data && response.data.order_url) {
        setPaymentUrl(response.data.order_url);
        // Store additional payment info for tracking
        localStorage.setItem(
          "zalopayTransactionInfo",
          JSON.stringify({
            app_trans_id: response.data.app_trans_id,
            zp_trans_token: response.data.zp_trans_token,
          })
        );

        // Redirect to ZaloPay payment page
        window.location.href = response.data.order_url;
      } else {
        throw new Error("Không thể tạo đường dẫn thanh toán");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        error.response?.data?.message || error.message || "Lỗi xử lý thanh toán"
      );
      toast.error("Không thể xử lý thanh toán. Vui lòng thử lại sau.");
      setProcessingPayment(false);
    }
  };

  const handleCancel = () => {
    setCancelModalVisible(true);
  };

  const handleCancelConfirm = () => {
    // Get the final reason (either selected or custom)
    const finalReason = cancelReason === "other" ? otherReason : cancelReason;

    // Log the cancellation reason for analytics or future improvements
    console.log("Cancellation reason:", finalReason);

    // Clear payment data from localStorage
    localStorage.removeItem("pendingPayment");
    localStorage.removeItem("zalopayTransactionInfo");

    // Show a thank you message
    toast.info("Cảm ơn bạn đã chia sẻ lý do hủy thanh toán", {
      position: "top-right",
      autoClose: 3000,
    });

    // Navigate back to homepage
    navigate("/registerinjection");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

  // Predefined list of common cancellation reasons
  const cancelReasons = [
    {
      value: "change_payment",
      label: "Tôi muốn thay đổi phương thức thanh toán",
    },
    { value: "change_vaccine", label: "Tôi muốn thay đổi loại vaccine" },
    { value: "change_date", label: "Tôi muốn thay đổi ngày tiêm" },
    { value: "price_issue", label: "Giá tiền không như tôi mong đợi" },
    { value: "reconsider", label: "Tôi cần thêm thời gian để cân nhắc" },
    { value: "other", label: "Lý do khác" },
  ];

  if (loading) {
    return (
      <div className="invoice-container loading">
        <Spin size="large" />
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-container">
        <div className="invoice-card">
          <div className="invoice-header">
            <h1>Lỗi Thanh Toán</h1>
            <p>Đã xảy ra lỗi khi xử lý thanh toán của bạn</p>
          </div>
          <div className="invoice-content">
            <p className="error-message">{error}</p>
            <div className="invoice-actions">
              <Button
                className="cancel-btn"
                onClick={() => navigate("/registerinjection")}
              >
                Quay Lại Đăng Ký
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="invoice-container">
        <div className="invoice-card">
          <div className="invoice-header">
            <h1>Không Có Thông Tin Thanh Toán</h1>
            <p>Không tìm thấy thông tin đăng ký tiêm chủng</p>
          </div>
          <div className="invoice-content">
            <div className="invoice-actions">
              <Button
                className="cancel-btn"
                onClick={() => navigate("/registerinjection")}
              >
                Quay Lại Đăng Ký
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="invoice-container">
        <div className="invoice-card">
          <div className="invoice-header">
            <h1>Xác Nhận Thanh Toán</h1>
            <p>Vui lòng kiểm tra thông tin đăng ký tiêm chủng của bạn</p>
          </div>

          <div className="invoice-content">
            <div className="invoice-section">
              <h2>Thông Tin Cá Nhân</h2>
              <div className="invoice-detail-row">
                <span className="label">Tên khách hàng:</span>
                <span className="value">{paymentData.customerName}</span>
              </div>

              {paymentData.appointmentData?.childInfo && (
                <>
                  <Divider className="section-divider" />
                  <h3>Thông Tin Trẻ Em</h3>
                  <div className="invoice-detail-row">
                    <span className="label">Tên trẻ:</span>
                    <span className="value">
                      {paymentData.appointmentData.childInfo.name}
                    </span>
                  </div>
                  <div className="invoice-detail-row">
                    <span className="label">Ngày sinh:</span>
                    <span className="value">
                      {paymentData.appointmentData.childInfo.birthday}
                    </span>
                  </div>
                  <div className="invoice-detail-row">
                    <span className="label">Giới tính:</span>
                    <span className="value">
                      {paymentData.appointmentData.childInfo.gender === "male"
                        ? "Nam"
                        : "Nữ"}
                    </span>
                  </div>
                  {paymentData.appointmentData.childInfo.healthNote && (
                    <div className="invoice-detail-row">
                      <span className="label">Ghi chú sức khỏe:</span>
                      <span className="value">
                        {paymentData.appointmentData.childInfo.healthNote}
                      </span>
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
                  {paymentData.type === "aptLe" ? "Vaccine Lẻ" : "Gói Vaccine"}
                </span>
              </div>
              <div className="invoice-detail-row">
                <span className="label">Tên vaccine:</span>
                <span className="value">{paymentData.vaccineName}</span>
              </div>
              <div className="invoice-detail-row highlight">
                <span className="label">Đơn giá:</span>
                <span className="value">
                  {paymentData.price?.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>

            <Divider className="section-divider" />

            <div className="invoice-section">
              <h2>Thông Tin Lịch Hẹn</h2>
              <div className="invoice-detail-row">
                <span className="label">Ngày tiêm:</span>
                <span className="value">
                  {formatDate(paymentData.appointmentData?.date)}
                </span>
              </div>
              <div className="invoice-detail-row">
                <span className="label">Thời gian:</span>
                <span className="value">
                  {paymentData.appointmentData?.time || "Chưa xác định"}
                </span>
              </div>
              <div className="invoice-detail-row">
                <span className="label">Ngày đăng ký:</span>
                <span className="value">
                  {formatDate(paymentData.appointmentData?.createAt)}
                </span>
              </div>
            </div>

            <div className="invoice-total">
              <span className="total-label">Tổng thanh toán:</span>
              <span className="total-value">
                {paymentData.price?.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>

            <div className="payment-method-info">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-method-zalopay">
                <img
                  src="/images/zalo-pay-logo.png"
                  alt="ZaloPay"
                  className="zalopay-logo"
                />
                <p>
                  Bạn sẽ được chuyển đến cổng thanh toán ZaloPay để hoàn tất
                  giao dịch
                </p>
              </div>
            </div>
          </div>

          <div className="invoice-actions">
            <Button
              className="cancel-btn"
              onClick={handleCancel}
              disabled={processingPayment}
            >
              Quay Lại
            </Button>
            <Button
              className="confirm-btn"
              type="primary"
              onClick={processPayment}
              loading={processingPayment}
            >
              Tiến Hành Thanh Toán
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Payment Modal */}
      <Modal
        title="Hủy thanh toán"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        footer={[
          <div key="footer" className="modal-footer-buttons">
            <Button key="back" onClick={() => setCancelModalVisible(false)}>
              Quay lại
            </Button>
            <Button
              key="submit"
              type="primary"
              danger
              onClick={handleCancelConfirm}
              disabled={
                !cancelReason || (cancelReason === "other" && !otherReason)
              }
            >
              Xác nhận hủy
            </Button>
          </div>,
        ]}
      >
        <div className="cancel-reason-container">
          <p>Vui lòng cho chúng tôi biết lý do bạn muốn hủy thanh toán này:</p>

          <Radio.Group
            onChange={(e) => setCancelReason(e.target.value)}
            value={cancelReason}
            className="cancel-reason-group"
          >
            <Space direction="vertical">
              {cancelReasons.map((reason) => (
                <Radio key={reason.value} value={reason.value}>
                  {reason.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          {cancelReason === "other" && (
            <Input.TextArea
              placeholder="Vui lòng nhập lý do của bạn..."
              rows={3}
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="other-reason-input"
            />
          )}

          <p className="cancel-note">
            Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ. Cảm ơn bạn đã
            dành thời gian chia sẻ!
          </p>
        </div>
      </Modal>
    </>
  );
};

export default PaymentPage;
