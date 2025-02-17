import { useState } from "react";
import { FaEye, FaEyeSlash, FaTimesCircle } from "react-icons/fa";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
=======
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
<<<<<<< HEAD
    fullname: "",
    email: "",
    phone: "",
    password: "",
=======
    email: "",
    phone: "",
    password: ""
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const navigate = useNavigate();

  const validateUsername = (username) => {
    if (username.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9]+$/.test(username))
      return "Username can only contain letters and numbers";
=======

  const validateUsername = (username) => {
    if (username.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9]+$/.test(username)) return "Username can only contain letters and numbers";
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone) => {
    if (!/^\d+$/.test(phone)) return "Phone number must contain only digits";
    if (phone.length < 10) return "Phone number must be at least 10 digits";
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must include uppercase, lowercase, and numbers";
    }
    return "";
  };

<<<<<<< HEAD
  const validateFullname = (fullname) => {
    if (fullname.length < 2) return "Full name must be at least 2 characters";
    if (!/^[A-Za-z\s]+$/.test(fullname)) return "Full name can only contain letters and spaces";
    if (fullname.replace(/\s/g, '').length < 6) return "Full name must contain at least 2 letters";
    return "";
  };

=======
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let validationError = "";
    switch (name) {
      case "username":
        validationError = validateUsername(value);
        break;
<<<<<<< HEAD
      case "fullname":
        validationError = validateFullname(value);
        break;
=======
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
      case "email":
        validationError = validateEmail(value);
        break;
      case "phone":
        validationError = validatePhone(value);
        break;
      case "password":
        validationError = validatePassword(value);
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
<<<<<<< HEAD
      fullname: validateFullname(formData.fullname),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
=======
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password)
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
    };

    if (Object.values(newErrors).some((error) => error !== "")) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
<<<<<<< HEAD
      const response = await fetch('http://localhost:8080/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Đăng ký thành công        
        setFormData({ username: "", fullname: "", email: "", phone: "", password: "" });
        toast.success("Registration successful:", data);
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
=======
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Form submitted:", formData);
      setFormData({ username: "", email: "", phone: "", password: "" });
    } catch (error) {
      console.error("Submission error:", error);
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
<<<<<<< HEAD
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.username ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
=======
                  className={`appearance-none block w-full px-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                />
                {errors.username && (
                  <div className="absolute right-0 top-2">
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.username && (
<<<<<<< HEAD
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.username}
                </p>
=======
                <p className="mt-2 text-sm text-red-600" role="alert">{errors.username}</p>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
              )}
            </div>

            <div>
<<<<<<< HEAD
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.fullname ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                />
                {errors.fullname && (
                  <div className="absolute right-0 top-2">
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.fullname && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.fullname}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
=======
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
<<<<<<< HEAD
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
=======
                  className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                />
                {errors.email && (
                  <div className="absolute right-0 top-2">
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.email && (
<<<<<<< HEAD
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
=======
                <p className="mt-2 text-sm text-red-600" role="alert">{errors.email}</p>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
              )}
            </div>

            <div>
<<<<<<< HEAD
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
=======
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                Phone number
              </label>
              <div className="mt-1 relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
<<<<<<< HEAD
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
=======
                  className={`appearance-none block w-full px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                />
                {errors.phone && (
                  <div className="absolute right-0 top-2">
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.phone && (
<<<<<<< HEAD
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.phone}
                </p>
=======
                <p className="mt-2 text-sm text-red-600" role="alert">{errors.phone}</p>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
              )}
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
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
<<<<<<< HEAD
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
=======
                  className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
<<<<<<< HEAD
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
=======
                <p className="mt-2 text-sm text-red-600" role="alert">{errors.password}</p>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
<<<<<<< HEAD
              disabled={
                loading || Object.values(errors).some((error) => error !== "")
              }
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || Object.values(errors).some((error) => error !== "")
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
=======
              disabled={loading || Object.values(errors).some((error) => error !== "")}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading || Object.values(errors).some((error) => error !== "") ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
<<<<<<< HEAD
              <a
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
=======
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default RegistrationForm;
=======
export default RegistrationForm;
>>>>>>> 4421b62bc36345f6c61f5368cd1e6571fb0fd47e
