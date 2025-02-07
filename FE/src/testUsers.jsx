import { Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";



const TestUsers = () => {
    const [userList, setUserList] = useState([]);


    const fetchUsers = async () => {
        const respone = await axios.get("https://6794b828aad755a134ea3e5d.mockapi.io/User");
        console.log(respone.data);
        setUserList(respone.data);
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);


    const columns = [
        {
            title: "UserID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "UserName",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "Phone",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Password",
            dataIndex: "password",
            key: "password",
            render: (password) => <p>{password}</p>,
        },  
    ];


  return (
    <div>
        <h1>User Management</h1>
        <Table dataSource={userList} columns={columns} />

        
    </div>
  );
}

export default TestUsers;