import { useState, useEffect } from "react";
import { Form, Input, Radio, message, Spin } from "antd";
import { useOutletContext } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
// import axios from "axios";
import "./ProfileInfo.css";
import axiosInstance from "../../../../service/api";

const ProfileInfo = () => {
  const { userData, refreshUserData } = useOutletContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Cập nhật form khi có dữ liệu mới
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        customerName: userData.customerName,
        phone: userData.phone,
        birthday: userData.birthday,
        address: userData.address,
        gender: userData.gender,
      });
    }
  }, [userData, form]);

  const handleUpdate = async () => {
    try {
      // Validate form trước khi gửi
      const values = await form.validateFields();
      setLoading(true);

      const accesstoken = localStorage.getItem("accesstoken");
      const tokenParts = accesstoken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      // Gọi API cập nhật
      await axiosInstance.post(`/customer/update/${userId}`, values, {
        headers: { Authorization: `Bearer ${accesstoken}` },
      });

      // Refresh data và hiển thị thông báo thành công
      await refreshUserData();
      message.success("Cập nhật thông tin thành công");
    } catch (error) {
      message.error("Cập nhật thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="content-header">
        <h2>Thông Tin Cá Nhân</h2>
        <p>Cập nhật thông tin cá nhân của bạn</p>
      </div>

      <div className="profile-info-container">
        <div className="avatar-section">
          <div className="avatar-container">
            <UserOutlined />
          </div>
          <div className="user-name">{userData?.customerName}</div>
        </div>

        <div className="form-section">
          <Form form={form} layout="vertical">
            <Form.Item
              name="customerName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại phải có 10 chữ số!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item name="gender" label="Giới tính">
              <Radio.Group>
                <Radio.Button value="Male">Nam</Radio.Button>
                <Radio.Button value="Female">Nữ</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Ngày sinh"
              rules={[
                {
                  pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                  message: "Định dạng ngày sinh không hợp lệ (DD/MM/YYYY)!",
                },
              ]}
            >
              <Input placeholder="DD/MM/YYYY" />
            </Form.Item>

            <button
              type="button"
              className="update-all-btn"
              onClick={handleUpdate}
            >
              Cập nhật thông tin
            </button>
          </Form>
        </div>
      </div>
    </Spin>
  );
};

export default ProfileInfo;
