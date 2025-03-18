import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, Spin, Slider, Checkbox, Radio } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import "./vaccineShopPage.css";
import axiosInstance from "../../../service/api";
import HeaderLayouts from "../../../components/layouts/header";

const VaccinePriceList = () => {
  const navigate = useNavigate();
  const [, setIsLoggedIn] = useState(false);
  const [, setUserRole] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Single");
  const [products, setProducts] = useState([]);
  const [packageProducts, setPackageProducts] = useState([]);
  const [importProductsPrice, setImportProductsPrice] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);

  const prefetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accesstoken");
      const [vaccineResponse, packageResponse, importResponse] = await Promise.all([
        axiosInstance.get("/vaccine/showInfo", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/vaccinepakage/showVaccinePakage", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/vaccineimport/getfullData", {
          headers: { Authorization: `Bearer ${token}` },
        }), 
      ]);

      const priceMap = {};
      importResponse.data.forEach(importData => {
        importData.vaccines.forEach(vaccine => {
          if (!priceMap[vaccine.vaccineId] || 
              new Date(importData.importDate) > new Date(priceMap[vaccine.vaccineId].importDate)) {
            priceMap[vaccine.vaccineId] = {
              unitPrice: vaccine.unitPrice,
              importDate: importData.importDate
            };
          }
        });
      });

      setProducts(vaccineResponse.data);
      setPackageProducts(packageResponse.data);
      setImportProductsPrice(priceMap);
      console.log(priceMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      setUserRole(payload.role);
    }

    prefetchData();
  }, [navigate]);

  useEffect(() => {
    document.title = "Bảng giá vắc-xin";
  }, []);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleManufacturerChange = (checkedValues) => {
    setSelectedManufacturers(checkedValues);
  };

  const handleAgeGroupChange = (checkedValues) => {
    setSelectedAgeGroups(checkedValues);
  };

  const handleDiseaseChange = (checkedValues) => {
    setSelectedDiseases(checkedValues);
  };

  const getFilteredProducts = () => {
    let filtered = selectedCategory === "Single" ? products : packageProducts;

    if (selectedManufacturers.length > 0) {
      filtered = filtered.filter((p) =>
        selectedManufacturers.includes(p.manufacturer)
      );
    }

    return filtered;
  };

  const handleMoreInfo = () => {
    navigate("/vaccineDetail");
  } 

  const footerRef = useRef(null);

  return (
    <div className="home-new-page">
      <HeaderLayouts footerRef={footerRef} />

      <div className="shop-container">
        {isLoading ? (
          <div className="loading-container">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <>
            <div className="shop-sidebar">
              <h3 className="sidebar-title">
                <FilterOutlined /> Bộ lọc sản phẩm
              </h3>

              <div className="sidebar-section">
                <h4>Loại vaccine</h4>
                <Radio.Group
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <Radio.Button value="Single">Vắc-xin lẻ</Radio.Button>
                  <Radio.Button value="Pack">Vắc-xin gói</Radio.Button>
                </Radio.Group>
              </div>

              <div className="sidebar-section">
                <h4>Khoảng giá</h4>
                <Slider
                  range
                  min={0}
                  max={1000000}
                  step={50000}
                  value={priceRange}
                  onChange={handlePriceChange}
                  tipFormatter={(value) => `${value.toLocaleString()}đ`}
                />
              </div>

              <div className="sidebar-section">
                <h4>Nhà sản xuất</h4>
                <Checkbox.Group
                  options={[
                    { label: "GSK", value: "GSK" },
                    { label: "Pfizer", value: "Pfizer" },
                  ]}
                  value={selectedManufacturers}
                  onChange={handleManufacturerChange}
                />
              </div>
            </div>

            <div className="shop-main-content">
              <div className="shop-header">
                <h2>
                  {selectedCategory === "Single" ? "Vắc-xin lẻ" : "Gói vắc-xin"}
                </h2>
                <span>{getFilteredProducts().length} sản phẩm</span>
              </div>

              <div className="product-grid">
                {getFilteredProducts().map((product) => (
                  <div className="product-card" key={product._id}>
                    <div className="product-image">
                      <img src={product.imageUrl} alt={product.vaccineName} />
                    </div>
                    <div className="product-info">
                      <h3>{product.vaccineName || product.packageName}</h3>
                      <p className="manufacturer">
                        Nhà sản xuất: {product.manufacturer}
                      </p>
                      <p className="description">{product.description}</p>
                      <div className="price-section">
                        <span className="price-label">Giá:</span>
                        <span className="price-value">
                          {importProductsPrice[product._id]?.unitPrice?.toLocaleString() ||
                            // product.price?.toLocaleString() ||
                            "Chưa có hàng"}
                        </span>
                      </div>
                      <button
                        className="view-more-btn"
                        onClick={() => handleMoreInfo(product._id)}
                      >
                        XEM THÊM
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {getFilteredProducts().length > 0 && (
                <div className="pagination-container">
                  <Pagination
                    current={currentPage}
                    total={getFilteredProducts().length}
                    pageSize={productsPerPage}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VaccinePriceList;