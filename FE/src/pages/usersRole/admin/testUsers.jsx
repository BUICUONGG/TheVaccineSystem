import { Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const TestUsers = () => {
  const [userList, setUserList] = useState([]);

  const fetchUsers = async () => {
    const respone = await axios.get("http://localhost:8080/user/showData");
    console.log(respone.data);
    setUserList(respone.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    document.title = "User Management";
  },[]);

  const columns = [
    {
      title: "UserID",
      dataIndex: "id",
      key: "id",
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
      <h1><b>User Management</b></h1>
      <Table dataSource={userList} columns={columns} />
    </div>
  );
};

export default TestUsers;