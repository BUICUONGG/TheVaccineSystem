import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Select, Button, DatePicker, Input, Radio, Switch } from 'antd';
import { UserOutlined, UserAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'; // Thay moment bằng dayjs
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./registerInjection.css";

const RegisterInjection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form] = Form.useForm();
  const [vaccineList, setVaccineList] = useState([]); // Chỉ giữ lại các states cần thiết
  const [parentInfo, setParentInfo] = useState(null);
  const [isChildRegistration, setIsChildRegistration] = useState(false);

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
        const response = await axios.get("http://localhost:8080/vaccine/showInfo");
        setVaccineList(response.data);
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
          setParentInfo(response.data); // Lưu thông tin phụ huynh
          
          // Nếu không phải đăng ký cho trẻ em thì điền form

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

      // Format appointment date từ Dayjs object
      const selectedDate = values.date;
      const formattedDate = selectedDate.format('DD/MM/YYYY');

      const registrationData = {
        cusId: userId,
        vaccineId: values.vaccineId,
        date: formattedDate,
        createAt: createAt,
        status: "pending",
        ...(isChildRegistration && {
          childInfo: {
            ...values.childInfo,
            birthday: values.childInfo.birthday.format('DD/MM/YYYY')
          }
        })
      };

      console.log("Sending data to server:", registrationData);

      const response = await axios.post(
        "http://localhost:8080/appointmentLe/create",
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

  // Sửa lại hàm disabledDate
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <div className="register-injection-page">
      
      

      <div className="main-content">
      <div className="back-home-wrapper">
        <Link to="/homepage" className="back-home">
          Back home
        </Link>
      </div>
        <div className="form-container">
          <h2 className="form-title">Đăng Ký Tiêm Chủng</h2>

          <div className="registration-type-switch">
            <span className={!isChildRegistration ? 'active-type' : ''}>
              <UserOutlined /> Đăng ký cho bản thân
            </span>
            <Switch 
              checked={isChildRegistration}
              onChange={(checked) => {
                setIsChildRegistration(checked);
                form.resetFields();
              }}
            />
            <span className={isChildRegistration ? 'active-type' : ''}>
              <UserAddOutlined /> Đăng ký cho trẻ em
            </span>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="registration-form"
          >
            {/* Phần thông tin cá nhân đơn giản hóa */}
            {isChildRegistration ? (
              <div className="form-section child-info-section">
                <h3>Thông Tin Trẻ Em</h3>
                <div className="child-info-container">
                  <Form.Item
                    name={["childInfo", "name"]}
                    label="Họ và tên trẻ"
                    rules={[{ required: true, message: 'Vui lòng nhập tên trẻ!' }]}
                  >
                    <Input placeholder="Nhập họ và tên trẻ" />
                  </Form.Item>

                  <Form.Item
                    name={["childInfo", "birthday"]}
                    label="Ngày sinh"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                  >
                    <DatePicker 
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh"
                      className="date-picker"
                    />
                  </Form.Item>

                  <Form.Item
                    name={["childInfo", "gender"]}
                    label="Giới tính"
                    rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                  >
                    <Radio.Group className="gender-select">
                      <Radio.Button value="male">Nam</Radio.Button>
                      <Radio.Button value="female">Nữ</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name={["childInfo", "healthNote"]}
                    label="Ghi chú sức khỏe"
                  >
                    <Input.TextArea 
                      placeholder="Nhập ghi chú về tình trạng sức khỏe của trẻ (nếu có)"
                      rows={4}
                    />
                  </Form.Item>
                </div>

                <div className="guardian-info">
                  <h4>Thông Tin Người Giám Hộ</h4>
                  <div className="info-display-grid">
                    <div className="info-item">
                      <label>Người giám hộ:</label>
                      <div className="info-value">{parentInfo?.customerName}</div>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại:</label>
                      <div className="info-value">{parentInfo?.phone}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-section personal-info-section">
                <h3>Thông Tin Cá Nhân</h3>
                <div className="personal-info-container">
                  <Form.Item label="Họ và tên">
                    <Input disabled value={parentInfo?.customerName} />
                  </Form.Item>
                  <Form.Item label="Ngày sinh">
                    <Input disabled value={parentInfo?.birthday} />
                  </Form.Item>
                  <Form.Item label="Số điện thoại">
                    <Input disabled value={parentInfo?.phone} />
                  </Form.Item>
                  <Form.Item label="Địa chỉ">
                    <Input disabled value={parentInfo?.address} />
                  </Form.Item>
                </div>
                {(!parentInfo?.customerName || !parentInfo?.phone || !parentInfo?.address) && (
                  <div className="update-info-notice">
                    <span className="notice-text">Vui lòng cập nhật đầy đủ thông tin cá nhân!</span>
                    <Link to="/profile" className="update-link">Cập nhật ngay</Link>
                  </div>
                )}
              </div>
            )}

            {/* Phần đăng ký tiêm chủng */}
            <div className="form-section vaccine-registration-section">
              <h3>Thông Tin Đăng Ký Tiêm</h3>
              
              <Form.Item
                name="vaccineId"
                label="Vaccine"
                rules={[{ required: true, message: 'Vui lòng chọn vaccine!' }]}
              >
                <Select placeholder="Chọn loại vắc xin">
                  {vaccineList.map(vaccine => (
                    <Select.Option key={vaccine._id} value={vaccine._id}>
                      {vaccine.vaccineName} - {vaccine.vaccineImports?.[0]?.price || "Chưa có giá"} VNĐ
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Ngày mong muốn tiêm"
                name="date"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày tiêm!' },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(dayjs().startOf('day'))) {
                        return Promise.reject('Không thể chọn ngày trong quá khứ');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  className="date-picker"
                  format="DD-MM-YYYY"
                  disabledDate={disabledDate}
                  placeholder="Chọn ngày tiêm"
                />
              </Form.Item>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="submit-btn"
                size="large"
              >
                Xác Nhận Đăng Ký
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

    </div>
  );
};

export default RegisterInjection;