import { useEffect, useState } from "react";
import { Table } from "antd";
import axios from "axios";

const CustomerDetail = (customerId) => {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomer = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:8080/customer/${customerId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setCustomer(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin customer:", error);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const columns = [
    { title: "CusName", dataIndex: "customerName", key: "customerName" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "BirthDate", dataIndex: "birthDate", key: "birthDate" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
  ];

  const data = customer
    ? [
        { key: "customerName", value: customer.customerName },
        { key: "phone", value: customer.phone },
        { key: "birthDate", value: customer.birthDate },
        { key: "address", value: customer.address },
        { key: "gender", value: customer.gender },
      ]
    : [];

  return (
    <div>
      <h2>Thông tin Chi tiết</h2>
      {customer ? (
        <Table columns={columns} dataSource={data} pagination={false} />
      ) : (
        <p>Chưa chọn customer</p>
      )}
    </div>
  );
};

export default CustomerDetail;
