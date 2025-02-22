import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pagination, Modal } from 'antd'; // Thêm Modal từ antd để hiển thị thông báo lỗi
import "./vaccineShopPage.css";

const VaccinePriceList = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Single");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/vaccine/listVaccine");
        setProducts(response.data.result);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

 


 

  useEffect(() => {
    document.title = "Bảng giá vắc-xin";
  }, []);

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const handleLogout = async () => {
    try {
      // Lấy thông tin userId và accesstoken từ localStorage
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      // Kiểm tra xem có userId và accesstoken không
      if (userId && accesstoken) {
        // Gọi API logout
        await axios.post(
          `http://localhost:8080/user/logout/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );
      }

      // Xóa hết thông tin người dùng khỏi localStorage
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
  

      // Chuyển hướng về trang đăng nhập
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Hiển thị thông báo lỗi nếu đăng xuất thất bại
      Modal.error({
        content: "Logout failed. Please try again.",
      });
    }
  };

  const handleCategoryChange = (event) => setSelectedCategory(event.target.value);

  const filteredProducts = selectedCategory === "Single"
    ? products
    : products.filter(product => product.category === selectedCategory);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  
 
  return (
    <div className="new-page">
      <header className="header-framework">
        <div className="header-content">
          <div className="header-title">
            <Link to="/homepage">
              <h1>Nhật Ký Tiêm Chủng</h1>
            </Link>
          </div>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                <img src="../icons/adminIcon.png" alt="User Avatar" className="avatar-icon" />
              </>
            ) : (
              <>
                <button className="login-btn" onClick={handleLogin}>Đăng nhập</button>
                <button className="register-btn" onClick={handleRegister}>Đăng ký</button>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="sub-navbar">
        <div className="nav-links">
          <a href="/homepage">Trang chủ</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Tin tức</a>
          <a href="#">Cẩm nang</a>
          <a href="#">Đăng ký tiêm</a>
        </div>
      </nav>

      <div className="product-filter">
        <label htmlFor="category">Chọn loại sản phẩm:</label>
        <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
          <option value="Single">Vắc-xin lẻ</option>
          <option value="Pack">Vắc-xin gói</option>
        </select>
      </div>

      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <p className="no-data">No Data</p>
        ) : (
          <>
            {currentProducts.map((product, index) => (
              <div className="product-card" key={index}>
                <img src={product.imageUrl} alt={product.vaccineName} />
                <h3><b>{product.vaccineName}</b></h3>
                <p>Nhà sản xuất: {product.manufacturer}</p>
                <span>Mô tả: {product.description}</span>
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
            total={filteredProducts.length}
            pageSize={productsPerPage}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default VaccinePriceList;
