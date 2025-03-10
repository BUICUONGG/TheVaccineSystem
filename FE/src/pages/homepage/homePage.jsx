import { useState, useEffect } from "react";
//import axios from "axios";
//import { Modal } from "antd";
import { FaRegCalendarAlt, FaRegListAlt, FaRegThumbsUp, FaRegSmileBeam } from "react-icons/fa";
import { FaSyringe, FaBook, FaUserCheck, FaMoneyBillWave } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./homePage.css";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  const banners = [
    "/images/banner1.png",
    "/images/banner2.jpg",
    "/images/banner3.png",
  ];

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      try {
        // Decode token để lấy role giống như trong loginPage.jsx
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        setUserRole(payload.role);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Invalid token:", error);
        setIsLoggedIn(false);
        setUserRole('');
      }
    }
    document.title = "Trang chủ";
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === banners.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === banners.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? banners.length - 1 : currentSlide - 1);
  };

  const handleLogout = () => {
    // Xóa toàn bộ thông tin authentication khỏi localStorage
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    
    // Chuyển hướng về trang login
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, []);

  useEffect(() => {
    // Thêm script cho Chatbase
    const script = document.createElement("script");
    script.innerHTML = `
      (function(){
        if(!window.chatbase||window.chatbase("getState")!=="initialized"){
          window.chatbase=(...arguments)=>{
            if(!window.chatbase.q){window.chatbase.q=[]}
            window.chatbase.q.push(arguments)
          };
          window.chatbase=new Proxy(window.chatbase,{
            get(target,prop){
              if(prop==="q"){return target.q}
              return(...args)=>target(prop,...args)
            }
          })
        }
        const onLoad=function(){
          const script=document.createElement("script");
          script.src="https://www.chatbase.co/embed.min.js";
          script.id="vKWuYUUWfXB2G64zbVA6i";
          script.domain="www.chatbase.co";
          document.body.appendChild(script)
        };
        if(document.readyState==="complete"){
          onLoad()
        }else{
          window.addEventListener("load",onLoad)
        }
      })();
    `;
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      document.head.removeChild(script);
    };
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className={`homepage ${isDarkMode ? "dark-mode" : ""}`}>
      <header className="header-framework">
        <div className="header-content">
          <div className="header-title">
            <Link to="/homepage">
            <h1>Diary Vaccine</h1>
            </Link>          
            <div className="header-subtitle">
              AN TOÀN - UY TÍN - CHẤT LƯỢNG HÀNG ĐẦU VIỆT NAM
            </div>
          </div>
          
          <div className="auth-buttons">
            <FaShoppingCart className="cart-icon" />
            {isLoggedIn ? (
              <>
                <button className="profile-btn" onClick={handleProfile}>
                  Profile
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  Đăng xuất
                </button>
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
            <button
              className={`theme-toggle-btn ${isDarkMode ? "dark" : ""}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            />
          </div>
        </div>
      </header>

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

        <button className="slider-button prev" onClick={prevSlide}>
          <IoIosArrowBack className="arrow-icon" />
        </button>
        <button className="slider-button next" onClick={nextSlide}>
          <IoIosArrowForward className="arrow-icon" />
        </button>

        <div className="slider-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <nav className="navbar">
          <div className="nav-links">
            <a href="/homepage">Trang chủ</a>
            <Link to="/news">Tin tức</Link>
            <Link to="/handbook">Cẩm nang</Link>
            <Link to="/advise">Tư vấn</Link>
            <Link to="/blogs">Blogs</Link>
            {userRole === 'admin' ? (
              <Link to="/admin">Quản trị</Link>
            ) : (
              <a href="/registerinjection">Đăng ký tiêm</a>
            )}
            {/* <a href="/registerinjection">Đăng ký tiêm</a> */}
          </div>
        </nav>
      </div>

      <div className="quick-access">
  <div className="icon-item">
    <FaSyringe size={50} style={{ color: "#4A90E2" }} />
    <span>CÁC GÓI TIÊM</span>
  </div>
  <div className="icon-item">
    <Link to="/camnang">
      <FaBook size={50} style={{ color: "#4A90E2" }} />
      <span>CẨM NANG</span>
    </Link>
  </div>
  <div className="icon-item">
    <FaUserCheck size={50} style={{ color: "#4A90E2" }} />
    <span>ĐĂNG KÝ TIÊM</span>
  </div>
  <div className="icon-item">
    <Link to="/pricelist">
      <FaMoneyBillWave size={50} style={{ color: "#4A90E2" }} />
      <span>GIÁ TIÊM</span>
    </Link>
  </div>
</div>

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

      <div className="vaccination-guide">
      <h2>CẨM NANG TIÊM CHỦNG</h2>
      <div className="guide-icons">
        <div className="guide-item">
          <FaRegCalendarAlt size={50} style={{ color: "#4A90E2" }} />
          <span>LỊCH TIÊM CHỦNG</span>
        </div>

        <div className="guide-item">
          <FaRegListAlt size={50} style={{ color: "#4A90E2" }} />
          <span>QUY TRÌNH TIÊM CHỦNG</span>
        </div>

        <div className="guide-item">
          <FaRegThumbsUp size={50} style={{ color: "#4A90E2" }} />
          <span>LƯU Ý TRƯỚC KHI TIÊM</span>
        </div>

        <div className="guide-item">
          <FaRegSmileBeam size={50} style={{ color: "#4A90E2" }} />
          <span>LƯU Ý SAU KHI TIÊM</span>
        </div>
      </div>
    </div>

      <div className="news-section">
        <h2>TIN TỨC SỨC KHỎE</h2>
        <div className="news-grid">
          <div className="news-item">
            <div className="news-image">
              <img src="/images/news1.jpeg" alt="COVID-19 News" />
            </div>
            <div className="news-content">
              <h3>
                60% mẫu giải trình tự gen ca COVID-19 ở các tỉnh phía Bắc nhiễm
                biến thể BA.5
              </h3>
              <p>
                Theo báo cáo về tình hình dịch bệnh COVID-19 của 28 tỉnh, thành
                phố từ Hà Tĩnh trở ra cho thấy từ đầu năm 2022 đến ngày 15/8,
                các địa phương đã ghi nhận tổng cộng 7.731.853 ca mắc
                COVID-19...
              </p>
              <a href="#" className="read-more">
                XEM THÊM
              </a>
            </div>
          </div>

          <div className="news-item">
            <div className="news-image">
              <img src="/images/news2.jpg" alt="COVID Test" />
            </div>
            <div className="news-content">
              <h3>
                Sáng 1/8: Có 3 dấu hiệu chính mắc bệnh đậu mùa khỉ; 1 tuần ghi
                nhận hơn 10 nghìn ca COVID-19 mới
              </h3>
              <p>
                Theo báo cáo về tình hình dịch bệnh COVID-19 của 28 tỉnh, thành
                phố từ Hà Tĩnh trở ra...
              </p>
              <a href="#" className="read-more">
                XEM THÊM
              </a>
            </div>
          </div>

          <div className="news-item">
            <div className="news-image">
              <img src="/images/news3.jpg" alt="Hospital Care" />
            </div>
            <div className="news-content">
              <h3>Nguy hiểm bệnh viêm não vào mùa</h3>
              <p>
                Theo báo cáo về tình hình dịch bệnh COVID-19 của 28 tỉnh, thành
                phố từ Hà Tĩnh trở ra cho thấy từ đầu năm 2022...
              </p>
              <a href="#" className="read-more">
                XEM THÊM
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DiVac</h3>
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

export default HomePage;
