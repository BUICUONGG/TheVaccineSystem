import { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import { useOutletContext } from "react-router-dom";
import './ProfileInfo.css';
import axiosInstance from "../../../../service/api";

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

      message.success('Đổi mật khẩu thành công');
      form.resetFields(['oldPassword', 'newPassword', 'confirmPassword']);
      setShowPasswordChange(false);
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
            onFinish={showPasswordChange ? handleChangePassword : handleUpdateInfo}
          >
            {/* Main Account Info */}
            <div className="account-info-section">
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                ]}
              >
                <Input  />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input  />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
              >
                <div className="password-field">
                  <Input.Password 
                    disabled 
                    value="********" 
                    style={{ width: 'calc(100% - 120px)' }}
                  />
                  <Button 
                    type="link" 
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="change-password-link"
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </Form.Item>

              {!showPasswordChange && (
                <div className="button-group" style={{ marginTop: '20px' }}>
                  {!isEditMode ? (
                    <Button
                      type="primary"
                      onClick={handleEdit}
                      className="update-all-btn"
                    >
                      Cập nhật thông tin
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="update-all-btn"
                        style={{ marginBottom: '10px' }}
                      >
                        Lưu thay đổi
                      </Button>   
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Password Change Section */}
            {showPasswordChange && (
              <div className="password-change-section">
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
