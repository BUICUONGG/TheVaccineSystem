import { useState, useEffect } from "react";

import "./homePage.css";
import { useNavigate } from "react-router-dom";

import { FaSearch } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const HomePage = () => {
  const navigate = useNavigate();
  // const [count, setCount] = useState({0})
  const [currentSlide, setCurrentSlide] = useState(0);

  // Array of banner images
  const banners = [
    "/images/banner1.jpg",
    "/images/banner2.jpg",
    "/images/banner3.png",
    // '/images/banner4.jpg',
    // '/images/banner5.jpg',
    // '/images/banner6.jpg',
    // '/images/banner7.jpg',
    // '/images/banner8.jpg',
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
  }, []);

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

  return (
    <div className="homepage">
      <header className="header-framework">
        <div className="header-content">
          {/* Logo */}
          <div className="header-logo-container">
            <img src="/images/header-logo.png" alt="Logo" />
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
              src="/images/vaccine-custom.jpg"
              alt="Tiêm chủng theo yêu cầu"
            />
            <h3>TIÊM CHỦNG THEO YÊU CẦU</h3>
            <a href="#" className="read-more">
              XEM THÊM
            </a>
          </div>
          <div className="vaccine-card">
            <img src="/images/vaccine-standard.jpg" alt="Tiêm chủng trọn gói" />
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
        <div className="news-grid">{/* Add your news articles here */}</div>
      </div>
    </div>
  );
};

export default HomePage;
