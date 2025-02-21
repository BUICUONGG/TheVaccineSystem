import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Pagination, Modal } from "antd"; // Thêm Modal từ antd để hiển thị thông báo lỗi
import "./vaccineShopPage.css";

const VaccinePriceList = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Single");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const productsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/vaccine/listVaccine"
        );

        setProducts(response.data.result);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    const username = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      // Load cart items for specific user
      const allCartItems = JSON.parse(localStorage.getItem("cartItems")) || {};
      setCartItems(allCartItems[username] || []);
    }
  }, []);

  // Save cart items for specific user
  useEffect(() => {
    if (isLoggedIn) {
      const username = localStorage.getItem("username");
      const allCartItems = JSON.parse(localStorage.getItem("cartItems")) || {};
      allCartItems[username] = cartItems;
      localStorage.setItem("cartItems", JSON.stringify(allCartItems));
    }
  }, [cartItems, isLoggedIn]);

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
      setCartItems([]); // Xóa giỏ hàng khi đăng xuất

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

  const handleCategoryChange = (event) =>
    setSelectedCategory(event.target.value);

  const filteredProducts =
    selectedCategory === "Single"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.vaccineName === product.vaccineName
      );
      if (existingItem) {
        // Nếu sản phẩm đã tồn tại, tăng số lượng
        return prevItems.map((item) =>
          item.vaccineName === product.vaccineName
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      // Nếu là sản phẩm mới, thêm với số lượng là 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (index) => {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newCartItems);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/checkoutPrice");
    }
  };

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
            <div className="cart-dropdown">
              <div className="cart-icon-container">
                <FaShoppingCart className="cart-icon" onClick={toggleCart} />
                {cartItems.length > 0 && (
                  <span className="cart-badge">{cartItems.length}</span>
                )}
              </div>
              {isCartOpen && (
                <div className="cart-dropdown-content show">
                  <div className="cart-header">
                    <span>Sản phẩm</span>
                    <span>Số lượng</span>
                    <span>Giá</span>
                    <span>Hành động</span>
                  </div>
                  {cartItems.length > 0 ? (
                    <>
                      {cartItems.map((item, index) => (
                        <div key={index} className="cart-item">
                          <span>{item.vaccineName}</span>
                          <span>{item.quantity || 1}</span>
                          <span>{item.price}</span>
                          <button
                            className="delete-btn"
                            onClick={() => removeFromCart(index)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      ))}
                      <button className="select-btn" onClick={handleCheckout}>
                        Thanh toán
                      </button>
                    </>
                  ) : (
                    <p>Giỏ hàng trống</p>
                  )}
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
                <img
                  src="../icons/adminIcon.png"
                  alt="User Avatar"
                  className="avatar-icon"
                />
              </>
            ) : (
              <>
                <button className="login-btn" onClick={handleLogin}>
                  Đăng nhập
                </button>
                <button className="register-btn" onClick={handleRegister}>
                  Đăng ký
                </button>
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
            {currentProducts.map((product, index) => (
              <div className="product-card" key={index}>
                <img src={product.imageUrl} alt={product.vaccineName} />
                <h3>
                  <b>{product.vaccineName}</b>
                </h3>
                <p>Nhà sản xuất: {product.manufacturer}</p>
                <span>Mô tả: {product.description}</span>
                <button
                  className="select-btn"
                  onClick={() => addToCart(product)}
                >
                  Chọn
                </button>
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
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>NHẬT KÝ TIÊM CHỦNG</h3>
            <p>Hệ thống quản lý tiêm chủng toàn diện</p>
          </div>
          <div className="footer-section">
            <h3>LIÊN HỆ</h3>
            <p>Email: contact@nhatkytiemchung.vn</p>
            <p>Hotline: 1900 xxxx</p>
            <p>Địa chỉ: Hà Nội, Việt Nam</p>
          </div>
          <div className="footer-section">
            <h3>THEO DÕI CHÚNG TÔI</h3>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Nhật Ký Tiêm Chủng. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default VaccinePriceList;
