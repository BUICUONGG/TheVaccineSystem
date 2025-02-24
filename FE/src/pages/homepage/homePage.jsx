import { useState, useEffect } from "react";
//import axios from "axios";
//import { Modal } from "antd";
import { FaRegCalendarAlt, FaRegListAlt, FaRegThumbsUp, FaRegSmileBeam } from "react-icons/fa";
import { FaSyringe, FaBook, FaUserCheck, FaMoneyBillWave } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./homePage.css";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
import { FaSearch, FaShoppingCart } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  const banners = [
    {
      image: "/images/banner1.png",
      title: "Đăng Ký Tiêm Chủng",
      description: "Bảo vệ sức khỏe cho bạn và gia đình",
      link: "/registerinjection",
      buttonText: "Đăng Ký Tiêm"
    },
    {
      image: "/images/banner2.jpg",
      title: "Blog Sức Khỏe",
      description: "Cập nhật thông tin y tế mới nhất",
      link: "/blogs",
      buttonText: "Xem Blog"
    },
    {
      image: "/images/banner3.png",
      title: "Tư Vấn Y Tế",
      description: "Đội ngũ bác sĩ chuyên nghiệp",
      link: "/advise",
      buttonText: "Tư Vấn Ngay"
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('accesstoken');
    if (token) {
      setIsLoggedIn(true);
      // Decode token để lấy role
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const role = payload.role;
      setUserRole(role);
      localStorage.setItem('role', role); // Lưu role vào localStorage
    }
    document.title = "Trang chủ";
    
    const timer = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide((prevSlide) =>
          prevSlide === banners.length - 1 ? 0 : prevSlide + 1
        );
        setFadeIn(true);
      }, 200);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentSlide(currentSlide === banners.length - 1 ? 0 : currentSlide + 1);
      setFadeIn(true);
    }, 200);
  };

  const prevSlide = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentSlide(currentSlide === 0 ? banners.length - 1 : currentSlide - 1);
      setFadeIn(true);
    }, 200);
  };

  const handleLogout = () => {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserRole('');
    navigate('/homepage');
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
    <div className="homepage">
      <header className="header-framework">
        <div className="header-content">
          <div className="header-left">
            <Link to="/homepage">
              <h1>Diary Vaccine</h1>
            </Link>
          </div>
          <div className="header-right">
            <nav className="nav-menu">
              <Link to="/homepage">Home</Link>
              
                <Link to="/blogs">Blog</Link>
            
              
                <Link to="/news">News</Link>
              
              <Link to="/registerInjection">Đăng Ký Tiêm</Link>
              <Link to="/contact">Contact Us</Link>
              <div className="avatar-dropdown">
                <div className="avatar-container">
                  <UserOutlined className="avatar-icon" />
                </div>
                <div className="avatar-dropdown-content">
                  {!isLoggedIn ? (
                    <>
                      <Link to="/login">Login</Link>
                      <Link to="/register">Register</Link>
                    </>
                  ) : (
                    <>
                      {userRole === 'admin' ? (
                        <Link to="/admin">Admin</Link>
                      ) : (
                        <Link to="/profile">Profile</Link>
                      )}
                      <button onClick={handleLogout}>Logout</button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="banner-container">
        <div className="banner-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {banners.map((banner, index) => (
            <div key={index} className="swiper-slide">
              <div className="banner-overlay"></div>
              <img src={banner.image} alt={banner.title} className="banner-image" />
              <div className={`slide-content ${currentSlide === index ? 'active' : ''} ${fadeIn && currentSlide === index ? 'fade-in' : ''}`}>
                <div className="elementor-slide-heading">{banner.title}</div>
                <div className="elementor-slide-description">{banner.description}</div>
                <Link to={banner.link} className="slide-button">
                  {banner.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button className="slider-button prev" onClick={prevSlide}>
          <i className="fas fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button className="slider-button next" onClick={nextSlide}>
          <i className="fas fa-chevron-right" aria-hidden="true"></i>
        </button>

        <div className="swiper-pagination">
          {banners.map((_, index) => (
            <span 
              key={index} 
              className={`swiper-pagination-bullet ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>

        {/* <nav className="navbar">
          <div className="nav-links">
            <a href="/homepage">Trang chủ</a>
            <Link to="/news">Tin tức</Link>
            <Link to="/handbook">Cẩm nang</Link>
            <Link to="/advise">Tư vấn</Link>
            <Link to="/blogs">Blogs</Link>
            userRole === 'admin' ? (
              <Link to="/admin">Quản trị</Link>
            ) : (
              <a href="/registerinjection">Đăng ký tiêm</a>
            )
          </div>
        </nav> */}
      </div>

      <div className="quick-access">
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
            <h3>Giới Thiệu</h3>
            <p>Hệ thống quản lý tiêm chủng cho trẻ em</p>
          </div>
          <div className="footer-section">
            <h3>LIÊN HỆ</h3>
            <p>Email: contact@nhatkytiemchung.vn</p>
            <p>Hotline: 1900 xxxx</p>
            <p>Địa chỉ: Nhà Văn Hóa Sinh Viên</p>
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
              <a href="#">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="#">
                <i className="fab fa-linkedin"></i>
              </a>
              
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>CopyRight &copy; 2025 Diary Vaccine | All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
