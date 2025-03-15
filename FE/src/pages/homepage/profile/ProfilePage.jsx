import { useState, useEffect } from "react";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Input, Select, message, Spin } from "antd";
import "./ProfilePage.css";
import axiosInstance from "../../../service/api";

const { Option } = Select;

const Profile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");

      if (!accesstoken) {
        message.error("Vui lòng đăng nhập để xem thông tin");
        navigate("/login");
        return;
      }

      // Decode token để lấy userId
      const tokenParts = accesstoken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id; // "67b53056af240f16ecf58a5c"

      try {
        // Fetch user data
        const [userResponse, customerResponse] = await Promise.all([
          axiosInstance.get("/users/showInfo", {
            headers: { Authorization: `Bearer ${accesstoken}` },
          }),
          axiosInstance.get(`/customer/getOneCustomer/${userId}`, {
            headers: { Authorization: `Bearer ${accesstoken}` },
          }),
        ]);

        console.log("Customer Response:", customerResponse.data); // Để debug

        const customerData = customerResponse.data;
        const userData = userResponse.data;

        // Set form values với dữ liệu từ response
        form.setFieldsValue({
          // username: userData.username,
          // email: userData.email,
          customerName: customerData.customerName,
          phone: customerData.phone,
          birthday: customerData.birthday,
          address: customerData.address,
          gender: customerData.gender,
        });

        setUserData({
          ...userData,
          ...customerData,
        });
      } catch (error) {
        console.error("Error in data fetching:", error);
        message.error("Không thể tải thông tin người dùng");
      }
    } catch (error) {
      console.error("Error in token processing:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        navigate("/login");
      } else {
        message.error("Không thể tải thông tin người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");

      // Decode token để lấy userId
      const tokenParts = accesstoken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      if (!accesstoken) {
        message.error("Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      const updatedData = {
        customerName: values.customerName?.trim() || null,
        phone: values.phone?.trim() || null,
        address: values.address?.trim() || null,
        gender: values.gender || null,
        birthday: values.birthday?.trim() || null,
      };

      await axiosInstance.post(`/customer/update/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${accesstoken}` },
      });

      message.success("Cập nhật thông tin thành công");
      fetchUserData(); // Refresh data after update
      navigate("/homepage");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Thông Tin Cá Nhân</h2>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="profile-form"
          initialValues={userData}
        >
          {/* <div className="form-row">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              className="form-item"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              className="form-item"
            >
              <Input disabled />
            </Form.Item>
          </div> */}

          <div className="form-row">
            <Form.Item
              name="customerName"
              label="Họ và tên"
              className="form-item"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                {
                  whitespace: true,
                  message: "Không được chỉ nhập khoảng trắng!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              className="form-item"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại phải có 10 chữ số!",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea maxLength={200} rows={4} />
          </Form.Item>

          <div className="form-row">
            <Form.Item
              name="gender"
              label="Giới tính"
              className="form-item"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select>
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
                <Option value="Other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Ngày sinh"
              className="form-item"
              rules={[
                {
                  pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                  message: "Định dạng ngày sinh không hợp lệ (DD/MM/YYYY)!",
                },
              ]}
            >
              <Input placeholder="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item className="submit-button">
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default Profile;
