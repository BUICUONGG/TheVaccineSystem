import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, DatePicker, Input, Radio, Switch, Checkbox } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./registerInjection.css";
import axiosInstance from "../../../service/api";
import HeaderLayouts from "../../../components/layouts/header";

const RegisterInjection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form] = Form.useForm();
  const [vaccineList, setVaccineList] = useState([]);
  const [parentInfo, setParentInfo] = useState(null);
  const [isChildRegistration, setIsChildRegistration] = useState(false);
  const [vaccinePackages, setVaccinePackages] = useState([]);
  const [selectedVaccineType, setSelectedVaccineType] = useState(null);
  const [selectedVaccineId, setSelectedVaccineId] = useState(null);
  const [importProductsPrice, setImportProductsPrice] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
    }
    document.title = "Đăng ký tiêm chủng";
  }, []);

  // Fetch danh sách vaccine
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const response = await axiosInstance.get("/vaccine/showInfo");
        setVaccineList(response.data);
      } catch (error) {
        console.error("Error fetching vaccines:", error);
        toast.error("Không thể tải danh sách vaccine", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchVaccines();
  }, []);

  // Fetch vaccine packages
  useEffect(() => {
    const fetchVaccinePackages = async () => {
      try {
        const response = await axiosInstance.get(
          "/vaccinepakage/showVaccinePakage"
        );
        setVaccinePackages(response.data);
      } catch (error) {
        console.error("Error fetching vaccine packages:", error);
        toast.error("Không thể tải danh sách gói vaccine", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchVaccinePackages();
  }, []);

  useEffect(() => {
    const fetchImportPrices = async () => {
      try {
        const token = localStorage.getItem("accesstoken");
        const response = await axiosInstance.get("/vaccineimport/getfullData", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ngày hiện tại 
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const priceMap = {};
        response.data.forEach((importData) => {
          importData.vaccines.forEach((vaccine) => {
            const expiryDate = new Date(vaccine.expiryDate.split("/").reverse().join("-"));

            // Lưu giá nếu vaccine còn hạn sử dụng
            if (expiryDate >= today) {
              if (
                !priceMap[vaccine.vaccineId] ||
                new Date(importData.importDate) > new Date(priceMap[vaccine.vaccineId].importDate)
              ) {
                priceMap[vaccine.vaccineId] = {
                  unitPrice: vaccine.unitPrice,
                  importDate: importData.importDate,
                };
              }
            }
          });
        });

        setImportProductsPrice(priceMap);
      } catch (error) {
        console.error("Error fetching import prices:", error);
        toast.error("Không thể tải thông tin giá", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchImportPrices();
  }, []);

  // 
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      // Kiểm tra nếu userId không tồn tại, không gọi API
      if (!userId || !accesstoken) {
        console.warn("User ID hoặc Access Token không tồn tại!");
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/customer/getOneCustomer/${userId}`, {
          headers: { Authorization: `Bearer ${accesstoken}`, },
        }
        );
        if (response.data) {
          setParentInfo(response.data);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Không thể tải thông tin người dùng", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn, form]);

  useEffect(() => {
    const savedData = localStorage.getItem('vaccineRegistrationData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        // Khôi phục trạng thái đăng ký
        setIsChildRegistration(parsedData.isChildRegistration);
        setSelectedVaccineType(parsedData.selectedVaccineType);
        setSelectedVaccineId(parsedData.selectedVaccineId);

        // Khôi phục form values
        if (parsedData.formValues) {
          const formValues = {
            ...parsedData.formValues,
            date: parsedData.formValues.date ? dayjs(parsedData.formValues.date) : undefined,
            childInfo: parsedData.formValues.childInfo ? {
              ...parsedData.formValues.childInfo,
              birthday: parsedData.formValues.childInfo.birthday ? dayjs(parsedData.formValues.childInfo.birthday) : undefined
            } : undefined
          };
          form.setFieldsValue(formValues);
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [form]);



  const handleVaccineSelect = (vaccine) => {
    // Kiểm tra giá cho từng loại vaccine
    if (selectedVaccineType === "single") {
      if (!importProductsPrice[vaccine._id]?.unitPrice) {
        toast.warning("Hiện chưa có lô vaccine này để tiêm!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
    } else {
      if (!vaccine.price) {
        toast.warning("Hiện chưa có gói vaccine này để tiêm!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
    }

    // Cập nhật ID vaccine được chọn
    setSelectedVaccineId(vaccine._id);

    const currentFormValues = form.getFieldsValue();

    // Cập nhật form values tùy theo loại vaccine
    if (selectedVaccineType === "single") {
      form.setFieldsValue({
        vaccineId: vaccine._id,
        vaccinePackageId: undefined,
      });
    } else {
      form.setFieldsValue({
        vaccineId: undefined,
        vaccinePackageId: vaccine._id,
      });
    }
    // Lưu dữ liệu vào localStorage
    saveFormData({
      ...currentFormValues,
      [selectedVaccineType === "single" ? "vaccineId" : "vaccinePackageId"]: vaccine._id
    });
  };

  const onFinish = async (values) => {
    try {
      const accesstoken = localStorage.getItem("accesstoken");
      const cusId = localStorage.getItem("cusId");

      if (!accesstoken) {
        navigate("/login");
        return;
      }

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const selectedDate = values.date.format("DD/MM/YYYY");

      let invoiceData = {
        cusId: cusId,
        childId: "",
        customerName: parentInfo?.customerName || "Khách hàng",
        date: selectedDate,
        time: time,
        status: "pending",
      };

      // Thêm thông tin trẻ em 
      if (isChildRegistration && values.childInfo) {
        invoiceData.childInfo = {
          name: values.childInfo.name,
          birthday: values.childInfo.birthday.format("DD/MM/YYYY"),
          gender: values.childInfo.gender,
          healthNote: values.childInfo.healthNote || "",
        };
      }

      // Thêm thông tin vaccine
      if (selectedVaccineType === "single") {
        const selectedVaccine = vaccineList.find(
          (v) => v._id === selectedVaccineId
        );
        invoiceData = {
          ...invoiceData,
          vaccineId: selectedVaccine._id,
          vaccineName: selectedVaccine.vaccineName,
          price: importProductsPrice[selectedVaccineId]?.unitPrice || 0,
          type: "aptLe",
        };
      } else {
        const selectedPackage = vaccinePackages.find(
          (p) => p._id === selectedVaccineId
        );
        invoiceData = {
          ...invoiceData,
          vaccinePackageId: selectedPackage._id,
          vaccineName: selectedPackage.packageName,
          price: selectedPackage.price || 0,
          type: "aptGoi",
        };
      }

      const clearSavedData = () => {
        localStorage.removeItem("vaccineRegistrationData");
      };

      // Chuyển đến trang thanh toán
      navigate("/payment", {
        state: {
          invoiceData,
        },
      });
      clearSavedData();
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      toast.error("Đăng ký thất bại, vui lòng thử lại sau", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const disabledBirthDate = (current) => {
    // Không cho chọn ngày trong tương lai
    return current && current > dayjs().endOf('day');
  };

  const saveFormData = (values) => {
    const formData = {
      isChildRegistration,
      selectedVaccineType,
      selectedVaccineId,
      formValues: {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
        childInfo: values.childInfo ? {
          ...values.childInfo,
          birthday: values.childInfo.birthday ? values.childInfo.birthday.format('YYYY-MM-DD') : undefined
        } : undefined
      }
    };
    localStorage.setItem('vaccineRegistrationData', JSON.stringify(formData));
  };

  const footerRef = useRef(null);

  return (
    <div className="form-register-page">
      <HeaderLayouts footerRef={footerRef} />
      <div className="form-main-content">
        <div className="form-back-home-wrapper">
          <Link to="/homepage" className="form-back-home">
            Về trang chủ
          </Link>
        </div>
        <div className="form-container">
          <h2 className="form-header">Đăng Ký Tiêm Chủng</h2>

          <div className="form-type-switch">
            <span className={!isChildRegistration ? "active-type" : ""}>
              <UserOutlined /> Đăng ký cho bản thân
            </span>
            <Switch
              checked={isChildRegistration}
              onChange={(checked) => {
                setIsChildRegistration(checked);
                form.resetFields();
              }}
            />
            <span className={isChildRegistration ? "active-type" : ""}>
              <UserAddOutlined /> Đăng ký cho trẻ em
            </span>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="form-registration"
            onValuesChange={(_, allValues) => {
              saveFormData(allValues);
            }}
          >
            {isChildRegistration ? (
              <div className="form-section form-child-info">
                <h3>Thông Tin Trẻ Em</h3>
                <div className="child-info-container">
                  <Form.Item
                    name={["childInfo", "name"]}
                    label="Họ và tên trẻ"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên trẻ!" },
                    ]}
                  >
                    <Input placeholder="Nhập họ và tên trẻ" />
                  </Form.Item>

                  <Form.Item
                    name={["childInfo", "birthday"]}
                    label="Ngày sinh"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày sinh!" },
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.resolve();
                          }
                          if (value.isAfter(dayjs())) {
                            return Promise.reject("Không thể chọn ngày sinh trong tương lai");
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh"
                      className="date-picker"
                      disabledDate={disabledBirthDate}
                      showToday={false}
                    />
                  </Form.Item>

                  <Form.Item
                    name={["childInfo", "gender"]}
                    label="Giới tính"
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính!" },
                    ]}
                  >
                    <Radio.Group className="gender-select">
                      <Radio.Button value="male">Nam</Radio.Button>
                      <Radio.Button value="female">Nữ</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name={["childInfo", "healthNote"]}
                    label="Ghi chú sức khỏe"
                  >
                    <Input.TextArea
                      placeholder="Nhập ghi chú về tình trạng sức khỏe của trẻ (nếu có)"
                      rows={4}
                    />
                  </Form.Item>
                </div>

                <div className="guardian-info">
                  <h4>Thông Tin Người Giám Hộ</h4>
                  <div className="info-display-grid">
                    <div className="info-item">
                      <label>Người giám hộ:</label>
                      <div className="info-value">
                        {parentInfo?.customerName}
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại:</label>
                      <div className="info-value">{parentInfo?.phone}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-section form-personal-info">
                <h3>Thông Tin Cá Nhân</h3>
                <div className="personal-info-container">
                  <Form.Item label="Họ và tên">
                    <Input disabled value={parentInfo?.customerName} />
                  </Form.Item>
                  <Form.Item label="Ngày sinh">
                    <Input disabled value={parentInfo?.birthday} />
                  </Form.Item>
                  <Form.Item label="Số điện thoại">
                    <Input disabled value={parentInfo?.phone} />
                  </Form.Item>
                  <Form.Item label="Địa chỉ">
                    <Input disabled value={parentInfo?.address} />
                  </Form.Item>
                </div>
                {(!parentInfo?.customerName ||
                  !parentInfo?.phone ||
                  !parentInfo?.address) && (
                    <div className="update-info-notice">
                      <span className="notice-text">
                        Vui lòng cập nhật đầy đủ thông tin cá nhân!
                      </span>
                      <Link to="/profile" className="update-link">
                        Cập nhật ngay
                      </Link>
                    </div>
                  )}
              </div>
            )}

            <div className="form-section form-vaccine-info">
              <h3>Thông Tin Đăng Ký Tiêm</h3>

              {/*Radio để chọn loại vaccine */}
              <Form.Item name="vaccineType" className="vaccine-type-selector">
                <Radio.Group
                  onChange={(e) => setSelectedVaccineType(e.target.value)}
                  value={selectedVaccineType}
                >
                  <Radio.Button value="single">Vaccine Lẻ</Radio.Button>
                  <Radio.Button value="package">Vaccine Gói</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name={selectedVaccineType === "single" ? "vaccineId" : "vaccinePackageId"}
                label="Chọn Vaccine"
                rules={[{ required: true, message: "Vui lòng chọn vaccine!" }]}
              >
                <div className="vaccine-cards">
                  {!selectedVaccineType ? (
                    <div className="no-vaccine-selected">
                      <p>Vui lòng chọn loại vaccine bên trên</p>
                    </div>
                  ) : selectedVaccineType === "single" ? (
                    vaccineList.map((vaccine) => {
                      const hasPrice = !!importProductsPrice[vaccine._id]?.unitPrice;
                      return (
                        <div
                          key={vaccine._id}
                          className={`vaccine-card ${selectedVaccineId === vaccine._id ? "selected" : ""} ${!hasPrice ? "no-price" : ""}`}
                          onClick={() => hasPrice && handleVaccineSelect(vaccine)}
                        >
                          {hasPrice && (
                            <Checkbox
                              checked={selectedVaccineId === vaccine._id}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleVaccineSelect(vaccine);
                              }}
                              className="vaccine-checkbox"
                            />
                          )}
                          <div className="vaccine-card-content">
                            <h3>{vaccine.vaccineName}</h3>
                            <p className="register-vaccine-description">
                              {vaccine.description}
                            </p>
                            <p className={`vaccine-price ${!hasPrice ? "unavailable" : ""}`}>
                              {hasPrice ? `${importProductsPrice[vaccine._id].unitPrice.toLocaleString()} VNĐ` : "Chưa có hàng"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    vaccinePackages.map((pack) => {
                      const hasPrice = !!pack.price;
                      return (
                        <div
                          key={pack._id}
                          className={`vaccine-card ${selectedVaccineId === pack._id ? "selected" : ""} ${!hasPrice ? "no-price" : ""}`}
                          onClick={() => hasPrice && handleVaccineSelect(pack)}
                        >
                          {hasPrice && (
                            <Checkbox
                              checked={selectedVaccineId === pack._id}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleVaccineSelect(pack);
                              }}
                              className="vaccine-checkbox"
                            />
                          )}
                          <div className="vaccine-card-content">
                            <h3>{pack.packageName}</h3>
                            <p className="register-vaccine-description">
                              {pack.description}
                            </p>
                            <p className={`vaccine-price ${!hasPrice ? "unavailable" : ""}`}>
                              {hasPrice ? `${pack.price.toLocaleString()} VNĐ` : "Chưa có giá"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Form.Item>

              <Form.Item
                label="Ngày mong muốn tiêm"
                name="date"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày tiêm!" },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(dayjs().startOf("day"))) {
                        return Promise.reject(
                          "Không thể chọn ngày trong quá khứ"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  className="date-picker"
                  format="DD-MM-YYYY"
                  disabledDate={disabledDate}
                  placeholder="Chọn ngày tiêm"
                />
              </Form.Item>

              <Button
                className="form-submit-btn"
                size="large"
                onClick={() => form.submit()}
                disabled={!selectedVaccineId}
              >
                Xác nhận đăng ký
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterInjection;
