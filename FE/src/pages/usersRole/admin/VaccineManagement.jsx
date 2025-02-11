import { Button, Form, Image, Input, Modal, Popconfirm, Table, Upload } from "antd";
import { useForm } from "antd/es/form/Form";
import FormItem from "antd/es/form/FormItem";
import axios from "axios";
import { useEffect, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from "react-toastify";
import uploadFile from "./utils/upload";

// Dữ liệu cứng ==> gọi là hardcode ==> phải lấy dữ liệu dưới back-end để làm việc ==> lấy API lên
const VaccineManagement = () => {
  const [vaccineList, setVaccineList] = useState([]);
  const [isOpened,setOpen] = useState(false);
  const [form] = useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: 'none',
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );
      
  const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: 'Avatar',
        dataIndex: 'avatar',
        key: 'avatar',
        render: (avatar) => <Image src={avatar} width={90} />, 
      },
      {
        title: 'Action',
        dataIndex: 'id',
        key: 'id',
        render: (id, vaccine) => {
          return (
            <>
              <Button type="primary" onClick={() => {
                setOpen(true);
                form.setFieldsValue(vaccine); // hien thi gia tri cu cua vaccine len form update
                if(vaccine.avatar){
                  // giup hien thi anh len form update
                  setFileList([
                    {
                      name: 'image.png',
                      status: 'done',
                      url: vaccine.avatar,
                    },
                  ]);
                }
              }}>
                Edit
              </Button>
              <Popconfirm 
              title="Delete vaccine"
              description="Are you sure to delete this vaccine"
              onConfirm={() => handleDeleteVaccine(id)}
              >   
                <Button danger type="primary" >Delete</Button>
              </Popconfirm>             
            </>
          ) 
        },
      },
      
    ];

    const handleDeleteVaccine = async (id) => {
      await axios.delete(`https://6794b828aad755a134ea3e5d.mockapi.io/Vaccine/${id}`);
      toast.success("Xoa thanh cong roi do");
      fetchStudent();
    }
// Get dữ liệu về == fetch , xử lý dữ liệu convention == handle 
  const fetchStudent = async () => {
// tạo ra 1 hành động để lấy dữ liệu dưới back-end
    console.log("hai vkl");  
// lấy danh sách data dưới back-end

// axios ==> là thư viện của react giúp lấy API (call API)                                                                                

// JS goi axios là promise ==> không xảy ra ngay lập tức, cần thời gian để xử lý ==> gọi là hành động bất đồng bộ
// await ==> phải chạy hết hành động mới tới hành động tiếp theo
    const respone = await axios.get('https://6794b828aad755a134ea3e5d.mockapi.io/Vaccine');
    console.log(respone.data);
    setVaccineList(respone.data);
    
  };
    const handleOpenModel = () => {
      setOpen(true);
    };

    const handleCloseModel = () => {
      setOpen(false);
    };

    const handleSubmitForm = async (values) => {
      console.log(values);
// upload anh len firebase
      if(values.avatar.file?.originFileObj){
        const url = await uploadFile(values.avatar.file.originFileObj);
        values.avatar = url;
      }
      if(values.id){
//update
        await axios.put(`https://6794b828aad755a134ea3e5d.mockapi.io/Vaccine/${values.id}`,values);
        toast.success("Cap nhat thanh cong roi do");
      }else{
//create
        await axios.post('https://6794b828aad755a134ea3e5d.mockapi.io/Vaccine',values);
        toast.success("Nhap thanh cong roi do");
      }
      
      handleCloseModel();
      fetchStudent();
      form.resetFields();
    };

    const getBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

// cần setup event ==> hàm chạy khi page vừa load lên (F5)
  useEffect(() => {
    fetchStudent();
  }, []);

// Khi su dung thu vien ant design phai import thu vien vao
  return <div><h1>VaccineManagement</h1>
    <ToastContainer/>
    <Button onClick={handleOpenModel}>Add new vaccine</Button>
    <Table dataSource={vaccineList} columns={columns} />
    <Modal 
    title="Create new vaccines" 
    open={isOpened} 
    onCancel={handleCloseModel}
    onOk={() => form.submit()}>
      <Form labelCol={{span:24}} form = {form} onFinish={handleSubmitForm}>

      <FormItem 
        label="Id"    
        name="id" hidden>
          <Input/>
        </FormItem>
        
        <FormItem 
        label="Name"
        rules={[
          {
            required:true,
            message:"Nhap vo di",
          },
        ]}
        name="name">
          <Input/>
        </FormItem>

        <FormItem 
        label="Type" 
        rules={[
          {
            required:true,
            message:"Nhap vo di",
          },
        ]}
        name="type">
          <Input/>
        </FormItem>

        <FormItem 
        label="Quantity" 
        rules={[
          {
            required:true,
            message:"Nhap vo di",
          },
        ]}
        name="quantity">
          <Input/>
        </FormItem>

        <FormItem 
        label="Avatar" 
        rules={[
          {
            required:true,
            message:"Nhap vo di",
          },
        ]}
        name="avatar">
          <Upload
        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
          >
        {fileList.length >= 8 ? null : uploadButton}
          </Upload>
        </FormItem>
      </Form>
    </Modal>

    {previewImage && (
        <Image
          wrapperStyle={{
            display: 'none',
          }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
  </div>
}

export default VaccineManagement