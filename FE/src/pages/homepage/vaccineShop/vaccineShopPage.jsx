import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
import { Pagination, Spin } from "antd"; // Thêm Modal và Spin từ antd để hiển thị thông báo lỗi và loading
import "./vaccineShopPage.css";
import axiosInstance from "../../../service/api";

const VaccinePriceList = () => {
  const navigate = useNavigate();
  const [, setIsLoggedIn] = useState(false);
  const [, setUserRole] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Single");
  const [products, setProducts] = useState([]);
  const [packageProducts, setPackageProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const [isLoading, setIsLoading] = useState(true);

  const prefetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accesstoken");
      const [vaccineResponse, packageResponse] = await Promise.all([
        axiosInstance.get("/vaccine/showInfo", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/vaccinepakage/showVaccinePakage", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProducts(vaccineResponse.data);
      setPackageProducts(packageResponse.data);
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
    // Kiểm tra authentication
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
      // Decode token để lấy role
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      setUserRole(payload.role);
    }

    prefetchData();
  }, [navigate]);

  useEffect(() => {
    document.title = "Bảng giá vắc-xin";
  }, []);

  // const handleLogin = () => navigate("/login");
  // const handleRegister = () => navigate("/register");

  // const handleLogout = async () => {
  //   try {
  //     // Lấy thông tin userId và accesstoken từ localStorage
  //     const userId = localStorage.getItem("userId");
  //     const accesstoken = localStorage.getItem("accesstoken");

  //     // Kiểm tra xem có userId và accesstoken không
  //     if (userId && accesstoken) {
  //       // Gọi API logout
  //       await axios.post(
  //         `http://localhost:8080/user/logout/${userId}`,
  //         {},
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accesstoken}`,
  //           },
  //         }
  //       );
  //     }

  //     // Xóa hết thông tin người dùng khỏi localStorage
  //     localStorage.removeItem("accesstoken");
  //     localStorage.removeItem("username");
  //     localStorage.removeItem("userId");
  //     setIsLoggedIn(false);

  //     // Chuyển hướng về trang đăng nhập
  //     navigate("/login");
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     // Hiển thị thông báo lỗi nếu đăng xuất thất bại
  //     Modal.error({
  //       content: "Logout failed. Please try again.",
  //     });
  //   }
  // };

  // Sửa hàm handleCategoryChange để reset currentPage
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset về trang 1 khi chuyển loại
  };

  // Tính toán lại số trang dựa trên dữ liệu đã lọc
  const filteredProducts =
    selectedCategory === "Single" ? products : packageProducts;

  const totalItems = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  return (
    <div className="new-page">
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          <div className="back-home-wrapper">
            <Link to="/homepage" className="back-home">
              Back home
            </Link>
          </div>
          <div className="product-filter">
            <label htmlFor="category">Chọn loại sản phẩm:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="Single">Vắc-xin lẻ</option>
              <option value="Pack">Vắc-xin gói</option>
            </select>
          </div>

          <div className="product-list">
            {filteredProducts.length === 0 ? (
              <p className="no-data">No Data</p>
            ) : (
              <>
                {currentProducts.map((product) => (
                  <div
                    className={
                      selectedCategory === "Pack"
                        ? "package-card"
                        : "product-card"
                    }
                    key={product._id}
                  >
                    {selectedCategory === "Single" ? (
                      // Single vaccine display
                      <>
                        <img src={product.imageUrl} alt={product.vaccineName} />
                        <h3>
                          <b>{product.vaccineName}</b>
                        </h3>
                        <p>Nhà sản xuất: {product.manufacturer}</p>
                        <span>Mô tả: {product.description}</span>
                        <div className="price-container">
                          <div className="price-content">
                            <span className="price-label">Giá: </span>
                            {product.vaccineImports &&
                            product.vaccineImports.length > 0 ? (
                              <span className="price-value">
                                {product.vaccineImports[0].price}
                              </span>
                            ) : (
                              <span className="price-unavailable">
                                Chưa có giá
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="view-more-btn">XEM THÊM</button>
                      </>
                    ) : (
                      // Package display
                      <>
                        <h3>
                          <b>{product.packageName}</b>
                        </h3>
                        <p className="description">{product.description}</p>
                        <div className="package-price">
                          {product.price.toLocaleString()}
                        </div>
                        <button onClick={() => navigate("/vaccineDetail")} className="view-more-btn">XEM THÊM</button>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Chỉ hiển thị pagination khi có sản phẩm */}
          {filteredProducts.length > 0 && (
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={productsPerPage}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false} // Tắt chức năng thay đổi số items/trang
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VaccinePriceList;