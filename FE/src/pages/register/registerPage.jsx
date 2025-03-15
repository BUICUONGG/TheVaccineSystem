import { useState } from "react";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./registerPage.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateUsername = (username) => {
    if (username.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9]+$/.test(username))
      return "Username can only contain letters and numbers";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let validationError = "";
    switch (name) {
      case "username":
        validationError = validateUsername(value);
        break;
      case "email":
        validationError = validateEmail(value);
        break;
      case "password":
        validationError = validatePassword(value);
        break;
      case "confirmPassword":
        validationError = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    setErrors({ ...errors, [name]: validationError });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      ),
    };

    if (Object.values(newErrors).some((error) => error !== "")) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(formData);

      if (response.ok) {
        // Đăng ký thành công
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        toast.success("Đăng ký thành công!");
        navigate("/login");
      } else {
        // Xử lý lỗi từ server
        toast.error(data.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginButton = () => {
    navigate("/login");
  };

  return (
    <div className="regis-min-h-screen">
      <Link to="/homepage" className="regis-back-home">
        Về trang chủ
      </Link>
      <div className="regis-container">
        <div className="regis-image-container">
          <div className="regis-image-overlay"></div>
        </div>
        <div className="regis-form-container">
          <div className="regis-form-header">
            <h2>Tạo tài khoản mới</h2>
            <p>Đăng ký để trải nghiệm dịch vụ của chúng tôi</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="regis-input-group">
              <FiUser className="regis-input-icon" />
              <input
                type="text"
                className="regis-input"
                placeholder="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <div className="regis-error">{errors.username}</div>}
            </div>
            
            <div className="regis-input-group">
              <FiMail className="regis-input-icon" />
              <input
                type="email"
                className="regis-input"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="regis-error">{errors.email}</div>}
            </div>
            
            <div className="regis-input-group">
              <FiLock className="regis-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="regis-input"
                placeholder="Mật khẩu"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="regis-password-toggle"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {errors.password && <div className="regis-error">{errors.password}</div>}
            </div>
            
            <div className="regis-input-group">
              <FiLock className="regis-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="regis-input"
                placeholder="Xác nhận mật khẩu"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="regis-password-toggle"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {errors.confirmPassword && <div className="regis-error">{errors.confirmPassword}</div>}
            </div>
            
            <div className="regis-button-group">
              <button
                type="button"
                className="regis-btn regis-btn-secondary"
                onClick={handleLoginButton}
              >
                Đăng Nhập
              </button>
              <button
                type="submit"
                disabled={loading}
                className="regis-btn regis-btn-primary"
              >
                {loading ? "Đang xử lý..." : "Đăng Ký"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
