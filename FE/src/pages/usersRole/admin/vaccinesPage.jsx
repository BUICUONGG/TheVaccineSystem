import { useState, useEffect } from "react";
import { Table, Input, Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const VaccinesPage = () => {
  const navigate = useNavigate();
  const [vaccineList, setVaccineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filteredVaccines, setFilteredVaccines] = useState([]);

  useEffect(() => {
    fetchVaccines();
  }, []);

  useEffect(() => {
    const filtered = vaccineList.filter(vaccine => 
      vaccine.vaccineName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredVaccines(filtered);
  }, [vaccineList, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/vaccine/listVaccine"
      );
      if (response.data.result) {
        setVaccineList(response.data.result);
        setFilteredVaccines(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      Modal.error({
        content: "Failed to fetch vaccines",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vaccineId) => {
    const accesstoken = localStorage.getItem("accesstoken");

    if (!accesstoken) {
      Modal.error({
        content: "You need to login first",
      });
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete this vaccine?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setDeleteLoading(true);
          await axios.delete(
            `http://localhost:8080/vaccine/delete/${vaccineId}`,
            {
              headers: {
                Authorization: `Bearer ${accesstoken}`,
              },
            }
          );

          await fetchVaccines();
          Modal.success({
            content: "Vaccine deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting vaccine:", error);
          if (error.response?.status === 401) {
            Modal.error({
              content: "Unauthorized. Please login again.",
            });
            navigate("/login");
          } else {
            Modal.error({
              content: "Failed to delete vaccine",
            });
          }
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, record, index) => index + 1,
      width: 70,
    },
    {
      title: "Vaccine Name",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price.toLocaleString()}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Manufacturing Date",
      dataIndex: "mfgDate",
      key: "mfgDate",
    },
    {
      title: "Expiration Date",
      dataIndex: "expDate",
      key: "expDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{
          color: status === "in stock" ? "#52c41a" : "#ff4d4f",
          textTransform: "capitalize"
        }}>
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
          loading={deleteLoading}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vaccine Inventory Management</h2>
      <Search
        placeholder="Search by vaccine name"
        allowClear
        enterButton
        onSearch={handleSearch}
        style={{ width: 300, marginBottom: 16 }}
      />
      <Table
        dataSource={filteredVaccines}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} vaccines`,
        }}
      />
    </div>
  );
};

export default VaccinesPage; 
