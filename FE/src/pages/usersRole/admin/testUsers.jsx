import { Table } from "antd";
// import axios from "axios";
import { useEffect, useState } from "react";
import axiosInstance from "../../../service/api";

const TestUsers = () => {
  const [userList, setUserList] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/user/showInfo");
      console.log(response.data);

      // Lấy danh sách users từ API
      const users = response.data.result || [];

      // Thêm số thứ tự cho từng user
      const usersWithIndex = users.map((user, index) => ({
        ...user,
        stt: index + 1, // STT bắt đầu từ 1
        key: user.id || index, // key giúp React tối ưu render
      }));

      setUserList(usersWithIndex);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    document.title = "User Management";
  }, []);

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: "UserID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "UserName",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      render: (password) => <p>{password}</p>,
    },
    {
      title: "role",
      dataIndex: "role",
      key: "role",
    },
  ];

  return (
    <div>
      <h1>
        <b>User Management</b>
      </h1>
      <Table dataSource={userList} columns={columns} />
    </div>
  );
};

export default TestUsers;
