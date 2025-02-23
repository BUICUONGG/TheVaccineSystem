import { useState } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./loginPage.css"; // Import file css mới
import { toast } from "react-toastify";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 1) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:8080/user/login",
          { username, password },
          { withCredentials: true }
        );

        // Lưu token và username vào localStorage
        localStorage.setItem("accesstoken", response.data.accesstoken);
        localStorage.setItem("userId", response.data.userId);

        // Decode token để lấy role
        const tokenParts = response.data.accesstoken.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const userRole = payload.role;

        setIsLoading(false);
        toast.success("Đăng nhập thành công!");

        // Kiểm tra role và điều hướng
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/homepage");
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Login failed:", error);
        alert(error.response?.data?.message || "Đăng nhập thất bại!");
      }
    }
  };

  const handleRegisterButton = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <div className="login-min-h-screen">
      <Link to="/homepage" className="login-back-home">
        Back home
      </Link>
      <div className="login-container">
        <div className="login-image-container">
          <div className="login-image-overlay"></div>
        </div>
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Please sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <FiUser className="login-input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="login-input-group">
              <FiLock className="login-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="login-input-group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label>Remember me</label>
            </div>
            <div className="login-button-group">
              <button
                type="button"
                className="login-btn login-btn-secondary"
                onClick={handleRegisterButton}
              >
                Sign Up
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="login-btn login-btn-primary"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
            <div className="login-divider">
              <span>Or continue with</span>
            </div>
            <div className="login-button-group">
              <button
                type="button"
                className="login-btn login-btn-secondary"
              >
                <FcGoogle className="h-5 w-5 mr-2" /> Sign in with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;