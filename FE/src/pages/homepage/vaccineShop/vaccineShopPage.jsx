import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, Spin, Checkbox, Radio, Select } from "antd";
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
  const [priceLevel, setPriceLevel] = useState("all");
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);

  const prefetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accesstoken");
      const [vaccineResponse, packageResponse, importResponse] =
        await Promise.all([
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
      importResponse.data.forEach((importData) => {
        importData.vaccines.forEach((vaccine) => {
          if (
            !priceMap[vaccine.vaccineId] ||
            new Date(importData.importDate) >
            new Date(priceMap[vaccine.vaccineId].importDate)
          ) {
            priceMap[vaccine.vaccineId] = {
              unitPrice: vaccine.unitPrice,
              importDate: importData.importDate,
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

  // Xóa vaccineId khỏi localStorage khi component mount
  useEffect(() => {
    localStorage.removeItem("vaccineId");
  }, []);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleManufacturerChange = (checkedValues) => {
    setSelectedManufacturers(checkedValues);
  };

  const getFilteredProducts = () => {
    let filtered = selectedCategory === "Single" ? products : packageProducts;

    if (selectedManufacturers.length > 0) {
      filtered = filtered.filter((p) =>
        selectedManufacturers.includes(p.manufacturer)
      );
    }

    // Filer gia san pham o day
    if (priceLevel !== "all") {
      filtered = filtered.filter((product) => {
        const productPrice = selectedCategory === "Single"
          ? importProductsPrice[product._id]?.unitPrice
          : product.price;

        if (!productPrice) return false;

        switch (priceLevel) {
          case "under500k":
            return productPrice < 500000;
          case "500kto1m":
            return productPrice >= 500000 && productPrice <= 1000000;
          case "above1m":
            return productPrice > 1000000;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const handleMoreInfo = (productId) => {
    localStorage.setItem("vaccineId", productId);

    navigate(`/vaccineDetail/${productId}`);
  };

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
                <h4>Mức giá</h4>
                <Select
                  style={{ width: '100%' }}
                  value={priceLevel}
                  onChange={(value) => setPriceLevel(value)}
                >
                  <Select.Option value="all">Tất cả mức giá</Select.Option>
                  <Select.Option value="under500k">Dưới 500,000 VNĐ</Select.Option>
                  <Select.Option value="500kto1m">500,000 - 1,000,000 VNĐ</Select.Option>
                  <Select.Option value="above1m">Trên 1,000,000 VNĐ</Select.Option>
                </Select>
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
                  <div
                    className={`product-card ${selectedCategory === "Pack" ? 'package-card' : ''}`}
                    key={product._id}
                  >
                    {selectedCategory === "Single" ? (
                      // Card cho vaccine lẻ
                      <>
                        <div className="product-image">
                          <img src={product.imageUrl} alt={product.vaccineName} />
                        </div>
                        <div className="product-info">
                          <h3>{product.vaccineName}</h3>
                          <p className="manufacturer">
                            Nhà sản xuất: {product.manufacturer}
                          </p>
                          <p className="description">{product.description}</p>
                          <div className="price-section">
                            <span className="price-label">Giá:</span>
                            <span className="price-value">
                              {importProductsPrice[product._id]?.unitPrice?.toLocaleString() || "Chưa có hàng"} 
                            </span>
                          </div>
                          <button
                            className="view-more-btn"
                            onClick={() => handleMoreInfo(product._id)}
                          >
                            XEM THÊM
                          </button>
                        </div>
                      </>
                    ) : (
                      // Card cho gói vaccine
                      <div className="package-info">
                        <div className="package-header">
                          <h3>{product.packageName}</h3>
                          <span className="vaccine-count">
                            {product.vaccines?.length || 0} vaccine
                          </span>
                        </div>
                        <p className="description">{product.description}</p>
                        <div className="package-details">
                          <div className="price-section">
                            <div className="price-row">
                              <span className="price-value package-price">
                                {product.price?.toLocaleString() || "Chưa có hàng"} 
                              </span>
                            </div>
                          </div>
                          <button
                            className="view-more-btn package-btn"
                            onClick={() => handleMoreInfo(product._id)}
                          >
                            XEM CHI TIẾT GÓI
                          </button>
                        </div>
                      </div>
                    )}
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
