import { useState } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./forgotPassword.css";
import { toast } from "react-toastify";
import axiosInstance from "../../service/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Check username, 2: Update password
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const validateUsername = () => {
    const newErrors = {};
    if (!username) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must include uppercase, lowercase, and numbers";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!password) return "Yêu cầu mật khẩu mới";
    if (confirmPassword !== password) return "Mật khẩu không khớp";
    return "";
  };

  const handleCheckUsername = async (e) => {
    e.preventDefault();
    if (validateUsername()) {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post("/user/check-username", {
          username,
        });
        if (response.data.exists) {
          setUserId(response.data.userId);
          setStep(2);
          toast.success("Tìm thấy tên đăng nhập! Vui lòng nhập mật khẩu mới");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Tên đăng nhập không tồn tại");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(confirmPassword, newPassword);

    const newErrors = {
      newPassword: passwordError,
      confirmPassword: confirmError,
    };

    setErrors(newErrors);

    if (!passwordError && !confirmError) {
      setIsLoading(true);
      try {
        await axiosInstance.post(`/user/update/${userId}`, {
          password: newPassword,
        });
        toast.success("Mật khẩu mới cập nhập thành công");
        navigate("/login");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Thất bại"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="forgot-min-h-screen">
      <div className="forgot-container">
        <div className="forgot-image-container">
          <div className="forgot-image-overlay"></div>
        </div>
        <div className="forgot-form-container">
          <div className="forgot-form-header">
            <h2>{step === 1 ? "Quên mật khẩu" : "Nhập mật khẩu mới"}</h2>
            <p>
              {step === 1
                ? "Nhập tên đăng nhập để đặt lại mật khẩu"
                : "Nhập mật khẩu mới"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleCheckUsername}>
              <div className="forgot-input-group">
                <FiUser className="forgot-input-icon" />
                <input
                  type="text"
                  className="forgot-input"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {errors.username && (
                <div className="forgot-error">{errors.username}</div>
              )}
              <div className="forgot-button-group">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="forgot-btn forgot-btn-primary"
                >
                  {isLoading ? "Đang kiểm tra..." : "Tiếp tục"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword}>
              <div className="forgot-input-group">
                <FiLock className="forgot-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="forgot-input"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    const passwordError = validatePassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      newPassword: passwordError,
                    }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="forgot-password-toggle"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && (
                <div className="forgot-error">{errors.newPassword}</div>
              )}

              <div className="forgot-input-group">
                <FiLock className="forgot-input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="forgot-input"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    const confirmError = validateConfirmPassword(
                      e.target.value,
                      newPassword
                    );
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: confirmError,
                    }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="forgot-password-toggle"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="forgot-error">{errors.confirmPassword}</div>
              )}

              <div className="forgot-button-group">
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    Object.values(errors).some((error) => error !== "")
                  }
                  className="forgot-btn forgot-btn-primary"
                >
                  {isLoading ? "Đang cập nhập..." : "Đặt lại mật khẩu"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;