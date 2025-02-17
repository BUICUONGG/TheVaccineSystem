import { useState } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
<<<<<<< HEAD
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./loginPage.css"; // Import file css mới
import { toast } from "react-toastify";
=======
import { useNavigate } from "react-router-dom";

>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e

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
<<<<<<< HEAD
    } else if (password.length < 1) {
=======
    } else if (password.length < 8) {
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
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
<<<<<<< HEAD
        const response = await axios.post(
          "http://localhost:8080/user/login",
          { username, password },
          { withCredentials: true }
        );

        // Lưu token và username vào localStorage
        localStorage.setItem("accesstoken", response.data.accesstoken);

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
=======
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Login successful");
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setIsLoading(false);
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
      }
    }
  };

<<<<<<< HEAD
  const handleRegisterButton = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Banner hình ảnh bên trái */}
=======
  const handleRegisterButton = (e) => {  
    e.preventDefault();
    navigate("/register");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
      <div className="lg:w-1/2 relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174"
          alt="Office workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-gray-900/25" />
<<<<<<< HEAD
        {/* Nút "Back home" đè lên ảnh */}
        <div className="back-home-wrapper">
          <Link to="/homepage" className="back-home">
            Back home
          </Link>
        </div>
      </div>

      {/* Phần form đăng nhập bên phải */}
=======
      </div>

>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
      <div className="lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
<<<<<<< HEAD
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
=======
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                  Username
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
<<<<<<< HEAD
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username}
                    </p>
=======
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                  )}
                </div>
              </div>

              <div>
<<<<<<< HEAD
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
=======
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
=======
                    className={`block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
<<<<<<< HEAD
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
=======
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
<<<<<<< HEAD
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
=======
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                Forgot password?
              </button>
            </div>

            <div className="mt-4 flex gap-4">
<<<<<<< HEAD
              <button
                type="button"
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleRegisterButton}
              >
                Sign Up
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
=======
            
            <button
              type="button"
              className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleRegisterButton}
            >
              Sign Up
            </button>

            
            <button
              type="submit"
              disabled={isLoading}
              className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
<<<<<<< HEAD
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
=======
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="w-full max-w-xs flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
<<<<<<< HEAD
                  <FcGoogle className="h-5 w-5 mr-2" /> Sign in with Google
=======
                   <FcGoogle className="h-5 w-5 mr-2" /> Sign in with Google  
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default LoginPage;
=======
export default LoginPage;
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
