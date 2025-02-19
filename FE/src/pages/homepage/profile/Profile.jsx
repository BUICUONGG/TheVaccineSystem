import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, Button, Modal, Form, Input, Select, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import "./Profile.css";

const { Option } = Select;

const Profile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [customerData, setCustomerData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const accesstoken = localStorage.getItem("accesstoken");
      const userId = localStorage.getItem("userId");

      if (!accesstoken) {
        message.error("Vui lòng đăng nhập để xem thông tin");
        navigate("/login");
        return;
      }

      const userResponse = await axios.get(
        "http://localhost:8080/users/showInfo",
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (userResponse.data) {
        setUserData(userResponse.data);
      }

      const customerResponse = await axios.get(
        `http://localhost:8080/customer/getOneCustomer/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      if (customerResponse.data) {
        setCustomerData(customerResponse.data);
        form.setFieldsValue({
          ...customerResponse.data,
          email: userResponse.data.email,
          username: userResponse.data.username
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      if (!userId || !accesstoken) {
        message.error("Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      const updatedData = {
        customerName: values.customerName?.trim() || null,
        phone: values.phone?.trim() || null,
        address: values.address?.trim() || null,
        gender: values.gender || null,
        birthday: values.birthday?.trim() || null
      };

      await axios.post(
        `http://localhost:8080/customer/update/${userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
          },
        }
      );

      message.success("Cập nhật thông tin thành công!");
      setIsModalVisible(false);
      
      window.location.reload();
      
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        navigate("/login");
      } else {
        message.error(error.response?.data?.message || "Không thể cập nhật thông tin");
      }
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    form.setFieldsValue(customerData);
    setIsModalVisible(true);
  };

  // Mapping for gender display
  const genderDisplay = {
    Male: "Nam",
    Female: "Nữ",
    Other: "Khác"
  };

  return (
    <div className="profile-container">
      <Card
        title="Thông Tin Cá Nhân"
        extra={
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={showModal}
          >
            Chỉnh sửa
          </Button>
        }
        loading={loading}
        style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}
      >
        <div className="profile-info">
          <p><strong>Tên đăng nhập:</strong> {userData?.username || "Chưa cập nhật"}</p>
          <p><strong>Email:</strong> {userData?.email || "Chưa cập nhật"}</p>
          <p><strong>Họ và tên:</strong> {customerData?.customerName || "Chưa cập nhật"}</p>
          <p><strong>Số điện thoại:</strong> {customerData?.phone || "Chưa cập nhật"}</p>
          <p><strong>Địa chỉ:</strong> {customerData?.address || "Chưa cập nhật"}</p>
          <p><strong>Giới tính:</strong> {customerData?.gender ? genderDisplay[customerData.gender] : "Chưa cập nhật"}</p>
          <p><strong>Ngày sinh:</strong> {customerData?.birthday || "Chưa cập nhật"}</p>
        </div>
      </Card>

      <Modal
        title="Cập nhật thông tin"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="customerName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { whitespace: true, message: "Không được chỉ nhập khoảng trắng!" }
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại phải có 10 chữ số!" }
            ]}
          >
            <Input maxLength={10} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea maxLength={200} />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới tính"
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
            rules={[
              {
                pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                message: "Định dạng ngày sinh không hợp lệ (DD/MM/YYYY)!"
              }
            ]}
          >
            <Input placeholder="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              style={{ marginRight: 8 }}
            >
              Cập nhật
            </Button>
            <Button onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
