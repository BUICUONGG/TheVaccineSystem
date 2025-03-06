import { useState, useEffect, useRef } from "react";
import axios from "axios";
//import { Modal } from "antd";
// import { FaRegCalendarAlt, FaRegListAlt, FaRegThumbsUp, FaRegSmileBeam } from "react-icons/fa";
import {
  FaSyringe,
  FaBook,
  FaUserCheck,
  FaMoneyBillWave,
  FaBaby,
  FaChild,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./homePage.css";
import { useNavigate } from "react-router-dom";
// import { UserOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
// import { FaSearch, FaShoppingCart } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [currentVaccineIndex, setCurrentVaccineIndex] = useState(0);
  const [flippedCardIndex, setFlippedCardIndex] = useState(null);

  const banners = [
    {
      image: "/images/banner1.png",
      title: "Đăng Ký Tiêm Chủng",
      description: "Bảo vệ sức khỏe cho bạn và gia đình",
      link: "/registerinjection",
      buttonText: "Đăng Ký Tiêm",
    },
    {
      image: "/images/banner2.jpg",
      title: "Blog Sức Khỏe",
      description: "Cập nhật thông tin y tế mới nhất",
      link: "/blogs",
      buttonText: "Xem Blog",
    },
    {
      image: "/images/banner3.png",
      title: "Tư Vấn Y Tế",
      description: "Đội ngũ bác sĩ chuyên nghiệp",
      link: "/advise",
      buttonText: "Tư Vấn Ngay",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const role = payload.role;
      setUserRole(role);
      // localStorage.setItem('role', role);
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
      setCurrentSlide(
        currentSlide === banners.length - 1 ? 0 : currentSlide + 1
      );
      setFadeIn(true);
    }, 200);
  };

  const prevSlide = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentSlide(
        currentSlide === 0 ? banners.length - 1 : currentSlide - 1
      );
      setFadeIn(true);
    }, 200);
  };

  const handleLogout = () => {
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserRole("");
    navigate("/thank-you");
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
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch vaccines for the carousel
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/vaccine/showInfo"
        );
        setVaccines(response.data);
      } catch (error) {
        console.error("Error fetching vaccines:", error);
      }
    };

    fetchVaccines();
  }, []);

  // Handle vaccine carousel navigation
  const nextVaccine = () => {
    if (vaccines.length > 0) {
      setCurrentVaccineIndex((prevIndex) =>
        prevIndex === vaccines.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevVaccine = () => {
    if (vaccines.length > 0) {
      setCurrentVaccineIndex((prevIndex) =>
        prevIndex === 0 ? vaccines.length - 1 : prevIndex - 1
      );
    }
  };

  // Calculate visible vaccines in the carousel
  const getVisibleVaccines = () => {
    if (vaccines.length === 0) return [];

    // Luôn hiển thị 5 card (hoặc tất cả nếu ít hơn 5)
    const totalVisible = Math.min(5, vaccines.length);

    // Đảm bảo luôn có card ở cả hai bên của card chính
    let indices = [];
    const offset = Math.floor(totalVisible / 2);

    for (let i = -offset; i <= offset; i++) {
      // Sử dụng phép toán modulo để tạo hiệu ứng vòng lặp
      let index = (currentVaccineIndex + i + vaccines.length) % vaccines.length;
      indices.push(index);
    }

    // Tính toán vị trí hiển thị cho mỗi card
    return indices.map((index, arrayIndex) => {
      // Tính position dựa trên vị trí trong mảng indices thay vì dựa vào index - currentVaccineIndex
      // Điều này đảm bảo luôn có card ở vị trí -2, -1, 0, 1, 2 bất kể currentVaccineIndex là gì
      const position = arrayIndex - offset;

      return {
        vaccine: vaccines[index],
        position: position, // Vị trí tương đối: -2, -1, 0, 1, 2
        // Nếu vị trí là card chính (0) thì opacity = 1, còn lại giảm dần theo khoảng cách
        opacity:
          Math.abs(position) === 0
            ? 1
            : Math.abs(position) === 1
            ? 0.7
            : Math.abs(position) === 2
            ? 0.4
            : 0.2,
      };
    });
  };

  // Hàm xử lý khi click vào thẻ
  const handleCardFlip = (index) => {
    if (flippedCardIndex === index) {
      setFlippedCardIndex(null);
    } else {
      setFlippedCardIndex(index);
    }
  };

  // Cập nhật timeline khi currentVaccineIndex thay đổi
  useEffect(() => {
    const timelineEl = document.querySelector(".vaccine-timeline-line-v4");
    if (timelineEl && vaccines.length > 0) {
      const percentage = (currentVaccineIndex / (vaccines.length - 1)) * 100;
      timelineEl.style.width = `${percentage}%`;
    }
  }, [currentVaccineIndex, vaccines.length]);

  return (
    <div className="homepage">
      <nav>
        <div className="logo">
          <Link to="/homepage">Diary Vaccine</Link>
        </div>
        <ul>
          <li>
            <Link to="/homepage">Trang chủ</Link>
          </li>
          <li>
            <Link to="/blogs">Blog</Link>
          </li>
          <li>
            <Link to="/news">Tin tức</Link>
          </li>
          <li>
            <Link to="#" onClick={scrollToFooter}>
              Liên hệ
            </Link>
          </li>
          {!isLoggedIn ? (
            <>
              <li>
                <Link to="/login">Đăng Nhập</Link>
              </li>
              <li>
                <Link to="/register">Đăng Ký</Link>
              </li>
            </>
          ) : (
            <>
              {userRole === "admin" ? (
                <li>
                  <Link to="/admin">Admin</Link>
                </li>
              ) : userRole === "staff" ? (
                <li>
                  <Link to="/staffLayout">Quản lý KH</Link>
                </li>
              ) : (
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="banner-container">
        <div
          className="banner-slider"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="swiper-slide">
              <div className="banner-overlay"></div>
              <img
                src={banner.image}
                alt={banner.title}
                className="banner-image"
              />
              <div
                className={`slide-content ${
                  currentSlide === index ? "active" : ""
                } ${fadeIn && currentSlide === index ? "fade-in" : ""}`}
              >
                <div className="elementor-slide-heading">{banner.title}</div>
                <div className="elementor-slide-description">
                  {banner.description}
                </div>
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
              className={`swiper-pagination-bullet ${
                currentSlide === index ? "active" : ""
              }`}
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

      {/* Vaccine Carousel Section - Phiên bản 1: Carousel dạng thẻ với hiệu ứng 3D (3 thẻ) */}
      <div className="vaccine-carousel-section-v1">
        <h2>VACCINE NỔI BẬT</h2>
        <div className="vaccine-carousel-container-v1">
          <button className="vaccine-nav-v1 prev" onClick={prevVaccine}>
            <FaChevronLeft />
          </button>

          <div className="vaccine-carousel-v1">
            {vaccines.map((vaccine, index) => {
              // Tính toán vị trí tương đối so với thẻ hiện tại
              const position =
                (index - currentVaccineIndex + vaccines.length) %
                vaccines.length;
              // Chỉ hiển thị 3 thẻ: thẻ hiện tại (0), thẻ trước (-1) và thẻ sau (1)
              const isVisible =
                position === 0 ||
                position === 1 ||
                position === vaccines.length - 1;
              // Chuyển đổi position để có giá trị -1, 0, 1
              const displayPosition =
                position === 0 ? 0 : position === 1 ? 1 : -1;

              return isVisible ? (
                <div
                  key={`v1-${vaccine._id}`}
                  className={`vaccine-card-item-v1 ${
                    displayPosition === 0 ? "center" : ""
                  }`}
                  style={{
                    transform: `translateX(${
                      displayPosition * 150
                    }px) translateZ(${
                      displayPosition === 0 ? 0 : -100
                    }px) rotateY(${displayPosition * 15}deg)`,
                    zIndex: 3 - Math.abs(displayPosition),
                    opacity: displayPosition === 0 ? 1 : 0.7,
                  }}
                >
                  <div className="vaccine-card-inner-v1">
                    <img
                      src={vaccine.imageUrl || "/images/vaccine-default.jpg"}
                      alt={vaccine.vaccineName}
                    />
                    <h3>{vaccine.vaccineName}</h3>
                    <p>Nhà sản xuất: {vaccine.manufacturer}</p>
                    <div className="vaccine-price-v1">
                      {vaccine.vaccineImports &&
                      vaccine.vaccineImports.length > 0
                        ? `${vaccine.vaccineImports[0].price.toLocaleString()} VNĐ`
                        : "Liên hệ"}
                    </div>
                    <Link to="/pricelist" className="vaccine-view-more-v1">
                      XEM THÊM
                    </Link>
                  </div>
                </div>
              ) : null;
            })}
          </div>

          <button className="vaccine-nav-v1 next" onClick={nextVaccine}>
            <FaChevronRight />
          </button>
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
