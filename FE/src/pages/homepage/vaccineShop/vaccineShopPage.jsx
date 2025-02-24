import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pagination, Modal } from 'antd'; // Thêm Modal từ antd để hiển thị thông báo lỗi
import "./vaccineShopPage.css";

const VaccinePriceList = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("Single");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    // Kiểm tra authentication
    const token = localStorage.getItem('accesstoken');
    if (token) {
      setIsLoggedIn(true);
      // Decode token để lấy role
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      setUserRole(payload.role);
    }

    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/vaccine/listVaccine",
          {
            headers: {
              Authorization: `Bearer ${token}` // Thêm token vào header
            }
          }
        );
        setProducts(response.data.result);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          navigate('/login');
        }
      }
    };

    fetchProducts();
  }, [navigate]);

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
      <div className="back-home-wrapper">
        <Link to="/homepage" className="back-home">
          Back home
        </Link>
      </div>

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
