import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal, Spin } from "antd";
import { FaSyringe, FaBook, FaUserCheck, FaMoneyBillWave, FaBaby, FaChild } from "react-icons/fa";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./homePage.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [vaccinePackages, setVaccinePackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs cho swiper
  const singleVaccineRef = useRef(null);
  const packageVaccineRef = useRef(null);

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
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const role = payload.role;
      setUserRole(role);
      localStorage.setItem('role', role);
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

    // Fetch vaccine data
    fetchVaccineData();

    return () => {
      clearInterval(timer);
    };
  }, [banners.length]);

  // Fetch vaccine data from API
  const fetchVaccineData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accesstoken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch single vaccines
      const vaccineResponse = await axios.get(
        "http://localhost:8080/vaccine/showInfo", 
        { headers }
      );
      
      // Fetch vaccine packages
      const packageResponse = await axios.get(
        "http://localhost:8080/vaccinepakage/showVaccinePakage", 
        { headers }
      );

      setVaccines(vaccineResponse.data);
      setVaccinePackages(packageResponse.data);
    } catch (error) {
      console.error("Error fetching vaccine data:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized error if needed
        console.log("Unauthorized access, but continuing as guest");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    navigate('/thank-you');
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

  // Thêm ref cho footer
  const footerRef = useRef(null);

  // Thêm function scroll
  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Swiper navigation functions
  const scrollSingleVaccines = (direction) => {
    if (singleVaccineRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      singleVaccineRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollPackageVaccines = (direction) => {
    if (packageVaccineRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      packageVaccineRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="homepage">
      <nav>
        <div className="logo">
          <Link to="/homepage">Diary Vaccine</Link>
        </div>
        <ul>
          <li><Link to="/homepage">Trang chủ</Link></li>
          <li><Link to="/blogs">Blog</Link></li>
          <li><Link to="/news">Tin tức</Link></li>
          <li><Link to="#" onClick={scrollToFooter}>Liên hệ</Link></li>
          {!isLoggedIn ? (
            <>
              <li><Link to="/login">Đăng Nhập</Link></li>
              <li><Link to="/register">Đăng Ký</Link></li>
            </>
          ) : (
            <>
              {userRole === 'admin' ? (
                <li><Link to="/admin">Admin</Link></li>
              ) : userRole === 'staff' ? (
                <li><Link to="/staffLayout">Quản lý KH</Link></li>
              ) : (
                <li><Link to="/profile">Profile</Link></li>
              )}
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          )}
        </ul>
      </nav>

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

        {/* Banner Cards */}
        <div className="banner-cards">
          <div className="banner-card">
            <div className="card-icon">
              <FaChild size={50} style={{ color: "#4A90E2" }} />
            </div>
            <div className="card-content">
              <h3>Đăng Ký Tiêm Chủng</h3>
              <p>Bảo vệ sức khỏe cho trẻ em với dịch vụ tiêm chủng an toàn</p>
            </div>
            <Link to="/registerInjection" className="card-button">
              Xem Thêm
            </Link>
          </div>

          <div className="banner-card">
            <div className="card-icon">
              <FaMoneyBillWave size={50} style={{ color: "#4A90E2" }} />
            </div>
            <div className="card-content">
              <h3>Bảng Giá Tiêm Chủng</h3>
              <p>Tham khảo bảng giá các gói tiêm chủng và vaccine</p>
            </div>
            <Link to="/pricelist" className="card-button">
              Xem Thêm
            </Link>
          </div>
        </div>
      </div>

      {/* <div className="quick-access">
        <div className="icon-item">
          <Link to="/pricelist">
            <FaMoneyBillWave size={50} style={{ color: "#4A90E2" }} />
            <span>GIÁ TIÊM</span>
          </Link>
        </div>
      </div> */}

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

      {/* Vaccine Swiper Sections */}
      <div className="vaccine-swiper-section">
        <div className="swiper-header">
          <h2>VACCINE LẺ NỔI BẬT</h2>
          <Link to="/pricelist" className="view-all">Xem tất cả</Link>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <div className="swiper-container">
            <button 
              className="swiper-nav-button left" 
              onClick={() => scrollSingleVaccines('left')}
            >
              <FaArrowLeft />
            </button>
            
            <div className="swiper-wrapper" ref={singleVaccineRef}>
              {vaccines.slice(0, 10).map((vaccine) => (
                <div className="swiper-slide" key={vaccine._id}>
                  <div className="vaccine-card-swiper">
                    <img 
                      src={vaccine.imageUrl || "/images/vaccine-default.jpg"} 
                      alt={vaccine.vaccineName} 
                      className="vaccine-image"
                    />
                    <h3>{vaccine.vaccineName}</h3>
                    <p className="manufacturer">NSX: {vaccine.manufacturer}</p>
                    <div className="price">
                      {vaccine.vaccineImports && vaccine.vaccineImports.length > 0 ? (
                        <span>{vaccine.vaccineImports[0].price.toLocaleString()} VNĐ</span>
                      ) : (
                        <span>Liên hệ</span>
                      )}
                    </div>
                    <Link to={`/pricelist`} className="view-detail-btn">
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="swiper-nav-button right" 
              onClick={() => scrollSingleVaccines('right')}
            >
              <FaArrowRight />
            </button>
          </div>
        )}
      </div>

      <div className="vaccine-swiper-section package-section">
        <div className="swiper-header">
          <h2>GÓI VACCINE TIÊU BIỂU</h2>
          <Link to="/pricelist" className="view-all">Xem tất cả</Link>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <div className="swiper-container">
            <button 
              className="swiper-nav-button left" 
              onClick={() => scrollPackageVaccines('left')}
            >
              <FaArrowLeft />
            </button>
            
            <div className="swiper-wrapper" ref={packageVaccineRef}>
              {vaccinePackages.slice(0, 10).map((pkg) => (
                <div className="swiper-slide" key={pkg._id}>
                  <div className="package-card-swiper">
                    <h3>{pkg.packageName}</h3>
                    <p className="package-description">{pkg.description.substring(0, 100)}...</p>
                    <div className="package-price">
                      <span>{pkg.price.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="package-info">
                      <span>Số mũi: {pkg.numberOfDoses || "N/A"}</span>
                    </div>
                    <Link to={`/pricelist`} className="view-detail-btn">
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="swiper-nav-button right" 
              onClick={() => scrollPackageVaccines('right')}
            >
              <FaArrowRight />
            </button>
          </div>
        )}
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

      <footer className="footer" ref={footerRef}>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Giới Thiệu</h3>
            <p>Hệ thống quản lý tiêm chủng cho trẻ em</p>
          </div>
          <div className="footer-section">
            <h3>PHÁP LÝ & CÂU HỎI</h3>
            <div className="legal-links">
              <Link to="/search">Tìm kiếm</Link>
              <Link to="/about">Giới thiệu</Link>
              <Link to="/privacy-policy">Chính sách bảo mật</Link>
              <Link to="/terms">Điều khoản dịch vụ</Link>
            </div>
          </div>
          <div className="footer-section">
            <h3>LIÊN HỆ</h3>
            <p>Email: DiaryVaccine@gmail.com</p>
            <p>Hotline: 1900 0000</p>
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

      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </div>
  );
};

export default HomePage;
