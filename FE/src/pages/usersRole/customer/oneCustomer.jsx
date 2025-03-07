import { useEffect, useState } from "react";
import { Form, Input, Select, Button, message } from "antd";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../service/api";

const CustomerProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const accessToken = localStorage.getItem("accesstoken");
        const response = await axiosInstance.get(
          `/customer/getOneCustomer/${userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        form.setFieldsValue(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Failed to load profile");
      }
    };

    fetchCustomerProfile();
  }, [form, userId]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accesstoken");
      await axiosInstance.post(`/customer/update/${userId}`, values, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      message.success("Profile updated successfully");
      navigate("/homepage");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="customerName"
          label="Full Name"
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please input your phone number!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="birthday"
          label="Birthday"
          rules={[{ required: true, message: "Please input your birthday!" }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: "Please input your address!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: "Please select your gender!" }]}
        >
          <Select>
            <Select.Option value="Male">Male</Select.Option>
            <Select.Option value="Female">Female</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CustomerProfile;
