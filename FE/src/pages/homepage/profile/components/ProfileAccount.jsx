import { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import { useOutletContext } from "react-router-dom";
import './ProfileAccount.css'; // Thay đổi import CSS
import axiosInstance from "../../../../service/api";
import { toast } from "react-toastify";

const ProfileAccount = () => {
  const { userData, refreshUserData } = useOutletContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [, setUserAccount] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchUserAccount = async () => {
      try {
        const accesstoken = localStorage.getItem("accesstoken");
        const tokenParts = accesstoken.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.id;

        const response = await axiosInstance.post(
          `/user/getme/${userId}`,
          {
            headers: { Authorization: `Bearer ${accesstoken}` }
          }
        );

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

  const handleEdit = () => {
    setIsEditMode(true);
  };



  const handleUpdateInfo = async (values) => {
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

      message.success('Cập nhật thông tin thành công');
      setIsEditMode(false);
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

      // Gọi API để cập nhật mật khẩu
      await axiosInstance.post(`/user/update/${userId}`, {
        password: values.newPassword, // API chỉ cần trường 'password'
      });

      toast.success("Mật khẩu mới cập nhật thành công");
      form.resetFields(["oldPassword", "newPassword", "confirmPassword"]);
      setShowPasswordChange(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Thất bại khi đổi mật khẩu");
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

      <div className="account-container">
        <div className="account-form-section">
          <Form
            form={form}
            layout="vertical"
            onFinish={showPasswordChange ? handleChangePassword : handleUpdateInfo}
          >
            <div className="account-info-section">
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
              >
                <div className="account-password-field">
                  <Input.Password
                    disabled
                    value="********"
                    style={{ width: 'calc(100% - 120px)' }}
                  />
                  <Button
                    type="link"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="account-change-password-link"
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </Form.Item>

              <button
                type="button"
                className="account-update-all-btn"
                onClick={handleUpdateInfo}
              >
                Cập nhật thông tin
              </button>
            </div>

            {showPasswordChange && (
              <div className="account-password-section">
                <div className="account-section-title">
                  <h2>Đổi mật khẩu</h2>
                </div>

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
                  className="account-update-all-btn"
                  onClick={() => form.submit()}
                >
                  Xác nhận đổi mật khẩu
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
