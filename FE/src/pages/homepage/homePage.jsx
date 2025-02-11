import { useState, useEffect } from "react";

import "./homePage.css";
import { useNavigate } from "react-router-dom";

import { FaSearch } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const HomePage = () => {
  const navigate = useNavigate();
  // const [count, setCount] = useState({0})
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);


  const banners = [
    "/images/banner1.png",
    "/images/banner2.jpg",
    "/images/banner3.png",

  ];

  // Auto slide function
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === banners.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Change slide every 5 seconds
    document.title = "Trang chủ";
    return () => clearInterval(timer);
  });

  // Manual slide functions
  const nextSlide = () => {
    setCurrentSlide(currentSlide === banners.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? banners.length - 1 : currentSlide - 1);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Cleanup dark mode when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, []);

  return (
    <div className={`homepage ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="header-framework">
        <div className="header-content">
          {/* Thay thế logo bằng text */}
          <div className="header-title">
            <h1>Nhật Ký Tiêm Chủng</h1>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <input type="text" placeholder="Tìm kiếm..." />
            <button className="search-button">
              <FaSearch className="search-icon" />
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="auth-buttons">
            <button className="login-btn" onClick={handleLogin}>
              Đăng nhập
            </button>
            <button className="register-btn" onClick={handleRegister}>
              Đăng ký
            </button>
            <button 
              className={`theme-toggle-btn ${isDarkMode ? 'dark' : ''}`} 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            />
          </div>
        </div>
      </header>

      {/* Banner Section */}
      <div className="banner-container">
        <div
          className="banner-slider"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <img
              key={index}
              src={banner}
              alt={`Banner ${index + 1}`}
              className="banner-image"
            />
          ))}
        </div>

        {/* Slider Controls */}
        <button className="slider-button prev" onClick={prevSlide}>
          <IoIosArrowBack className="arrow-icon" />
        </button>
        <button className="slider-button next" onClick={nextSlide}>
          <IoIosArrowForward className="arrow-icon" />
        </button>

        {/* Slider Indicators */}
        <div className="slider-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-links">
            <a href="#">Trang chủ</a>
            <a href="#">Giới thiệu</a>
            <a href="#">Tin tức</a>
            <a href="#">Cẩm nang</a>
            <a href="#">Đăng ký tiêm</a>
            <a href="#">Cẩm nang</a>
          </div>
        </nav>
      </div>

      {/* Quick Access Icons Section */}
      <div className="quick-access">
        <div className="icon-item">
          <img src="/icons/injection.png" alt="Các gói tiêm" />
          <span>CÁC GÓI TIÊM</span>
        </div>
        <div className="icon-item">
          <img src="/icons/handbook.png" alt="Cẩm nang" />
          <span>CẨM NANG</span>
        </div>
        <div className="icon-item">
          <img src="/icons/register.png" alt="Đăng ký tiêm" />
          <span>ĐĂNG KÝ TIÊM</span>
        </div>
        <div className="icon-item">
          <img src="/icons/price.png" alt="Giá tiêm" />
          <span>GIÁ TIÊM</span>
        </div>
      </div>

      {/* Vaccine Information Section */}
      <div className="vaccine-info">
        <h2>THÔNG TIN VACCINE</h2>
        <div className="vaccine-types">
          <div className="vaccine-card">
            <img
              src="/images/vaccineInfo1.webp"
              alt="Tiêm chủng theo yêu cầu"
            />
            <h3>TIÊM CHỦNG THEO YÊU CẦU</h3>
            <a href="#" className="read-more">
              XEM THÊM
            </a>
          </div>
          <div className="vaccine-card">
            <img src="/images/vaccineInfo2.jpg" alt="Tiêm chủng trọn gói" />
            <h3>TIÊM CHỦNG TRỌN GÓI</h3>
            <a href="#" className="read-more">
              XEM THÊM
            </a>
          </div>
        </div>
      </div>

      {/* Vaccination Guide Section */}
      <div className="vaccination-guide">
        <h2>CẨM NANG TIÊM CHỦNG</h2>
        <div className="guide-icons">
          <div className="guide-item">
            <img src="/icons/calendar.png" alt="Lịch tiêm chủng" />
            <span>LỊCH TIÊM CHỦNG</span>
          </div>
          <div className="guide-item">
            <img src="/icons/process.png" alt="Quy trình tiêm chủng" />
            <span>QUY TRÌNH TIÊM CHỦNG</span>
          </div>
          <div className="guide-item">
            <img src="/icons/benefits.png" alt="Lưu ý trước khi tiêm" />
            <span>LƯU Ý TRƯỚC KHI TIÊM</span>
          </div>
          <div className="guide-item">
            <img src="/icons/after-care.png" alt="Lưu ý sau khi tiêm" />
            <span>LƯU Ý SAU KHI TIÊM</span>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="news-section">
        <h2>TIN TỨC SỨC KHỎE</h2>
        <div className="news-grid">
          <div className="news-item">
            <div className="news-image">
              <img src="/images/news1.jpg" alt="COVID-19 News" />
            </div>
            <div className="news-content">
              <h3>60% mẫu giải trình tự gen ca COVID-19 ở các tỉnh phía Bắc nhiễm biến thể BA.5</h3>
              <p>Theo báo cáo về tình hình dịch bệnh COVID-19 của 28 tỉnh, thành phố từ Hà Tĩnh trở ra cho thấy từ đầu năm 2022 đến ngày 15/8, các địa phương đã ghi nhận tổng cộng 7.731.853 ca mắc COVID-19...</p>
              <a href="#" className="read-more">XEM THÊM</a>
            </div>
          </div>

          <div className="news-item">
            <div className="news-image">
              <img src="/images/news2.jpg" alt="COVID Test" />
            </div>
            <div className="news-content">
              <h3>Sáng 1/8: Có 3 dấu hiệu chính mắc bệnh đậu mùa khỉ; 1 tuần ghi nhận hơn 10 nghìn ca COVID-19 mới</h3>
              <p>Theo báo cáo về tình hình dịch bệnh COVID-19 của 28 tỉnh, thành phố từ Hà Tĩnh trở ra...</p>
              <a href="#" className="read-more">XEM THÊM</a>
            </div>
          </div>

          <div className="news-item">
            <div className="news-image">
              <img src="/images/news3.jpg" alt="Hospital Care" />
            </div>
            <div className="news-content">
              <h3>Nguy hiểm bệnh viêm não vào mùa</h3>
              <p>Theo báo cáo về tình hình dịch bệnh COVID-19 của 28 tỉnh, thành phố từ Hà Tĩnh trở ra cho thấy từ đầu năm 2022...</p>
              <a href="#" className="read-more">XEM THÊM</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
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

export default HomePage;
