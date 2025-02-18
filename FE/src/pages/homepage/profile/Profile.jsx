import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Input, Select, Button, message } from "antd";
import "./Profile.css";

const { Option } = Select;

const Profile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 1. Check accessToken và lấy thông tin user khi component mount
  useEffect(() => {
    const accesstoken = localStorage.getItem("accesstoken");
    const userId = localStorage.getItem("userId");

    if (!accesstoken) {
      message.error("Vui lòng đăng nhập để xem thông tin");
      navigate("/login");
      return;
    }

    // 2. Lấy thông tin customer
    const fetchCustomerData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/customer/getOneCustomer/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );

        if (response.data) {
          form.setFieldsValue(response.data);
        }
      } catch (error) {
        message.error("Không thể tải thông tin khách hàng");
        console.error("Error:", error);
      }
    };

    fetchCustomerData();
  }, [form, navigate]);

  // 3. Xử lý cập nhật thông tin
  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      await axios.post(
        `http://localhost:8080/customer/update/${userId}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      message.success("Cập nhật thông tin thành công!");
      navigate("/homepage");
    } catch (error) {
      message.error("Không thể cập nhật thông tin");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Render form
  return (
    <div className="profile-container">
      <h2>Thông Tin Cá Nhân</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdate}
      >
        <Form.Item
          name="customerName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="birthday"
          label="Ngày sinh"
          rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
        >
          <Input placeholder="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        >
          <Select>
            <Option value="Male">Nam</Option>
            <Option value="Female">Nữ</Option>
            <Option value="Other">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
