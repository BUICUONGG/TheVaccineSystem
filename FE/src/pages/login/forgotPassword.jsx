import { useState } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./forgotPassword.css";
import { toast } from "react-toastify";

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
      newErrors.username = "Username is required";
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
    if (!password) return "Password is required";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validatePasswords = () => {
    const newErrors = {};
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(confirmPassword, newPassword);

    if (passwordError) {
      newErrors.newPassword = passwordError;
    }
    if (confirmError) {
      newErrors.confirmPassword = confirmError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckUsername = async (e) => {
    e.preventDefault();
    if (validateUsername()) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:8080/user/check-username",
          { username }
        );
        if (response.data.exists) {
          setUserId(response.data.userId);
          setStep(2);
          toast.success("Username found! Please set your new password.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Username not found");
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
        await axios.post(`http://localhost:8080/user/update/${userId}`, {
          password: newPassword,
        });
        toast.success("Password updated successfully!");
        navigate("/login");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update password");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="forgot-min-h-screen">
      {/* <Link to="/homepage" className="forgot-back-home">
        Về trang chủ
      </Link> */}
      <div className="forgot-container">
        <div className="forgot-image-container">
          <div className="forgot-image-overlay"></div>
        </div>
        <div className="forgot-form-container">
          <div className="forgot-form-header">
            <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
            <p>
              {step === 1
                ? "Enter your username to reset password"
                : "Enter your new password"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleCheckUsername}>
              <div className="forgot-input-group">
                <FiUser className="forgot-input-icon" />
                <input
                  type="text"
                  className="forgot-input"
                  placeholder="Username"
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
                  {isLoading ? "Checking..." : "Continue"}
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
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    const passwordError = validatePassword(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      newPassword: passwordError
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
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    const confirmError = validateConfirmPassword(
                      e.target.value,
                      newPassword
                    );
                    setErrors(prev => ({
                      ...prev,
                      confirmPassword: confirmError
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
                  disabled={isLoading || Object.values(errors).some(error => error !== "")}
                  className="forgot-btn forgot-btn-primary"
                >
                  {isLoading ? "Updating..." : "Reset Password"}
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
