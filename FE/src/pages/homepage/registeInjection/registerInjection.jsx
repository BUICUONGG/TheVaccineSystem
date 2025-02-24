import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Select, Button } from 'antd';
import { toast } from 'react-toastify'; // Thêm toast
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./registerInjection.css";

const RegisterInjection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form] = Form.useForm();
  const [vaccineList, setVaccineList] = useState([]); // Chỉ giữ lại các states cần thiết

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
    }
    document.title = "Đăng ký tiêm chủng";
  }, []);

  // Thêm useEffect để fetch danh sách vaccine
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const response = await axios.get("http://localhost:8080/vaccine/listVaccine");
        console.log("API Response:", response.data); // Kiểm tra response
        setVaccineList(response.data.result); // Đảm bảo lấy đúng data
      } catch (error) {
        console.error("Error fetching vaccines:", error);
        toast.error('Không thể tải danh sách vaccine', {
          position: "top-right",
          autoClose: 3000
        });
      }
    };
    fetchVaccines();
  }, []);

  // Fetch user info khi component mount và user đã đăng nhập
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");
  
      // Kiểm tra nếu userId không tồn tại, không gọi API
      if (!userId || !accesstoken) {
        console.warn("User ID hoặc Access Token không tồn tại!");
        return;
      }
  
      try {
        const response = await axios.get(
          `http://localhost:8080/customer/getOneCustomer/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );
  
        console.log("User Info:", response.data);
  
        // Cập nhật form nếu có dữ liệu trả về
        if (response.data) {
          form.setFieldsValue({
            customerName: response.data.customerName,
            birthday: response.data.birthday, // Giữ nguyên dạng string từ API
            phone: response.data.phone,
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Không thể tải thông tin người dùng", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
  
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn, form]);   

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      if (userId && accesstoken) {
        await axios.post(
          `http://localhost:8080/user/logout/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );
      }

      localStorage.removeItem("accesstoken");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Logout failed. Please try again.', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  const onFinish = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      const userId = localStorage.getItem("userId");

      // Get current date for createAt
      const today = new Date();
      const createAt = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      // Format appointment date (date field)
      const dateInput = values.date;
      const [inputDay, inputMonth, inputYear] = dateInput.split('-');
      const formattedDate = `${inputDay}/${inputMonth}/${inputYear}`; // Convert from DD-MM-YYYY to DD/MM/YYYY

      // Prepare data according to database schema
      const registrationData = {
        cusId: userId,
        vaccineId: values.vaccineId,
        date: formattedDate,
        createAt: createAt,
        status: "incomplete"
      };

      console.log("Sending data to server:", registrationData);

      const response = await axios.post(
        "http://localhost:8080/appointment/create",
        registrationData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success('Đăng ký tiêm chủng thành công!', {
          position: "top-center",
          autoClose: 2000,
          onClose: () => navigate("/homepage")
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  return (
    <div className="register-injection-page">
      <header className="header-framework">
        <div className="header-content">
          <div className="header-title">
            <Link to="/homepage">
              <h1>Nhật Ký Tiêm Chủng</h1>
            </Link>
          </div>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
                <img
                  src="../icons/adminIcon.png"
                  alt="User Avatar"
                  className="avatar-icon"
                />
              </>
            ) : (
              <>
                <button className="login-btn" onClick={handleLogin}>
                  Đăng nhập
                </button>
                <button className="register-btn" onClick={handleRegister}>
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="sub-navbar">
        <div className="nav-links">
          <a href="/homepage">Trang chủ</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Tin tức</a>
          <a href="#">Cẩm nang</a>
          <a href="#">Đăng ký tiêm</a>
        </div>
      </nav>

      <div className="main-content">
        <div className="form-container">
          <h2 className="form-title">Đăng Ký Tiêm Chủng</h2>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish} // Chỉ để onFinish ở đây, bỏ onClick ở button
            className="registration-form"
          >
            <div className="form-section">
              <h3>Thông tin người đăng ký</h3>
              <Form.Item
                label="Họ và tên"
                name="customerName"
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="birthday"
              >
                <Input disabled /> {/* Thay DatePicker bằng Input disabled */}
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input disabled />
              </Form.Item>
            </div>

            <div className="form-section">
              <h3>Thông tin tiêm chủng</h3>
              <Form.Item
                label="Loại vắc xin"
                name="vaccineId" // Đổi thành vaccineId để lưu ID của vaccine
                rules={[{ required: true, message: 'Vui lòng chọn loại vắc xin!' }]}
              >
                <Select placeholder="Chọn loại vắc xin">
                  {Array.isArray(vaccineList) && vaccineList.length > 0 ? (
                    vaccineList.map((vaccine) => (
                      <Select.Option key={vaccine._id} value={vaccine._id}>
                        {vaccine.vaccineName} - {vaccine.vaccineImports?.[0]?.price || "Chưa có giá"} VNĐ
                      </Select.Option>
                    ))
                  ) : (
                    <Select.Option value="">Loading vaccines...</Select.Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                label="Ngày mong muốn tiêm"
                name="date"
                rules={[
                  { required: true, message: 'Vui lòng nhập ngày tiêm!' },
                  {
                    pattern: /^\d{2}-\d{2}-\d{4}$/,
                    message: 'Vui lòng nhập đúng định dạng DD-MM-YYYY'
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      
                      const [day, month, year] = value.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      
                      if (
                        date.getDate() === day &&
                        date.getMonth() === month - 1 &&
                        date.getFullYear() === year &&
                        date >= new Date() // Kiểm tra ngày phải từ hiện tại trở đi
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject('Ngày không hợp lệ hoặc đã qua');
                    }
                  }
                ]}
              >
                <Input 
                  placeholder="DD-MM-YYYY"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="submit-btn"
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>NHẬT KÝ TIÊM CHỦNG</h3>
            <p>Hệ thống quản lý tiêm chủng toàn diện</p>
          </div>
          <div className="footer-section">
            <h3>LIÊN HỆ</h3>
            <p>Email: contact@nhatkytiemchung.vn</p>
            <p>Hotline: 1900 xxxx</p>
            <p>Địa chỉ: Hà Nội, Việt Nam</p>
          </div>
          <div className="footer-section">
            <h3>THEO DÕI CHÚNG TÔI</h3>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Nhật Ký Tiêm Chủng. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RegisterInjection;