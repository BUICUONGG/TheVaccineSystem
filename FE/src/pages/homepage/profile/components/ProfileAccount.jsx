import { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import { useOutletContext } from "react-router-dom";
// import axios from "axios";
import "./ProfileInfo.css";
import axiosInstance from "../../../../service/api";

const ProfileAccount = () => {
  const { userData, refreshUserData } = useOutletContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [, setUserAccount] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch thông tin user account
  useEffect(() => {
    const fetchUserAccount = async () => {
      try {
        const accesstoken = localStorage.getItem("accesstoken");
        const tokenParts = accesstoken.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.id;

        const response = await axiosInstance.get(`/user/getOne/${userId}`, {
          headers: { Authorization: `Bearer ${accesstoken}` },
        });

        setUserAccount(response.data);
        form.setFieldsValue({
          username: response.data.username,
          email: response.data.email,
        });
      } catch (error) {
        message.error("Không thể tải thông tin tài khoản", error);
      }
    };

    fetchUserAccount();
  }, [form]);

  const handleUpdateUserInfo = async (values) => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const tokenParts = accesstoken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      await axiosInstance.post(
        `/user/update/${userId}`,
        {
          username: values.username,
          email: values.email,
        },
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      message.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      await refreshUserData();
    } catch (error) {
      message.error("Cập nhật thông tin thất bại", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const tokenParts = accesstoken.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id;

      await axiosInstance.post(
        `/user/changePassword/${userId}`,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      );

      message.success("Đổi mật khẩu thành công");
      form.resetFields(["oldPassword", "newPassword", "confirmPassword"]);
    } catch (error) {
      message.error("Đổi mật khẩu thất bại", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="content-header">
        <h2>Thông Tin Tài Khoản</h2>
        <p>Xem và cập nhật thông tin đăng nhập của bạn</p>
      </div>

      <div className="profile-info-container">
        <div className="form-section">
          <Form
            form={form}
            layout="vertical"
            onFinish={isEditing ? handleUpdateUserInfo : handleChangePassword}
          >
            {/* User Info Section */}
            <div className="user-info-section">
              <h3>Thông tin đăng nhập</h3>

              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                ]}
              >
                <Input disabled={!isEditing} />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input disabled={!isEditing} />
              </Form.Item>

              <Button
                type="primary"
                onClick={() => {
                  if (isEditing) {
                    form.submit();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="edit-button"
              >
                {isEditing ? "Lưu thông tin" : "Chỉnh sửa"}
              </Button>
            </div>

            {/* Password Change Section */}
            {!isEditing && (
              <div className="password-section">
                <h3>Đổi mật khẩu</h3>

                <Form.Item
                  name="oldPassword"
                  label="Mật khẩu hiện tại"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu hiện tại!",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("Mật khẩu xác nhận không khớp!");
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  className="update-all-btn"
                >
                  Đổi mật khẩu
                </Button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </Spin>
  );
};

export default ProfileAccount;
