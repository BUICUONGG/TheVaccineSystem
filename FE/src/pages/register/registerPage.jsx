import { useState } from "react";
import { FaEye, FaEyeSlash, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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
        //toast.success("Registration successful:", data);
        // Có thể thêm thông báo thành công hoặc chuyển hướng người dùng
        navigate("/login");
      } else {
        // Xử lý lỗi từ server
        toast.error("Registration failed:", data.message);
        // Có thể hiển thị thông báo lỗi cho người dùng
      }
    } catch (error) {
      toast.error("Submission error:", error);
      // Xử lý lỗi kết nối
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="regis-min-h-screen">
      <div className="regis-max-w-md">
        <div>
          <h2 className="regis-text-3xl">Tạo tài khoản của bạn</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="regis-block">
              Tên đăng nhập
            </label>
            <div className="regis-relative">
              <input
                className="regis-input"
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <div className="regis-absolute">
                  <FaTimesCircle />
                </div>
              )}
            </div>
            {errors.username && (
              <p className="regis-text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="regis-block">
              Email
            </label>
            <div className="regis-relative">
              <input
                className="regis-input"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div className="regis-absolute">
                  <FaTimesCircle />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="regis-text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="regis-block">
              Mật khẩu
            </label>
            <div className="regis-relative">
              <input
                className="regis-input"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="regis-absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="regis-text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="regis-block">
              Xác nhận mật khẩu
            </label>
            <div className="regis-relative">
              <input
                className="regis-input"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="regis-absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
              {errors.confirmPassword && (
                <div className="regis-absolute">
                  <FaTimesCircle />
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="regis-text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="regis-button"
            disabled={loading || Object.values(errors).some((error) => error !== "")}
          >
            {loading ? (
              <span>
                <svg className="regis-animate-spin" {...props} />
                Đang xử lý...
              </span>
            ) : (
              "Đăng ký"
            )}
          </button>

          <div className="regis-text-center">
            <p className="regis-text-gray-600">
              Đã có tài khoản?
              <a href="/login" className="regis-text-indigo-600">
                Đăng nhập
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
