import React, { useState, useEffect, useRef } from "react";
import { FaSyringe, FaBook, FaUserCheck, FaMoneyBillWave, FaBaby, FaChild, FaChevronLeft, FaChevronRight, FaCommentAlt, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { EyeOutlined, HeartOutlined, HeartFilled, CommentOutlined, ShareAltOutlined, UserOutlined, LogoutOutlined, DownOutlined, StarFilled } from "@ant-design/icons";
import { Dropdown, Space, Avatar, Menu, Rate, Carousel } from "antd";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./homePage.css";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../service/api";
import FeedbackForm from "../../components/Feedback/FeedbackForm";
import HeaderLayouts from "../../components/layouts/header";

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
  const [cusId, setCusId] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [username, setUsername] = useState("");
  // Thêm state cho blog
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [likedBlogStates, setLikedBlogStates] = useState({});
  // Thêm state cho news
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Mảng đường dẫn hình ảnh news
  const newsImages = [
    "/images/news/news1.jpeg",
    "/images/news/news2.jpg",
    "/images/news/news3.jpg",
    "/images/news/news4.webp",
  ];

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

  const [customerFeedbacks, setCustomerFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
      try {
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const role = payload.role;
        setUserRole(role);

        // Get username from localStorage with consistent key
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        }

        // Lấy cusId từ localStorage nếu là customer
        if (role === "customer") {
          const storedCusId = localStorage.getItem("cusId");
          if (storedCusId) {
            console.log("Đã lấy cusId từ localStorage:", storedCusId);
            setCusId(storedCusId);
          } else {
            console.log("Không tìm thấy cusId trong localStorage");
          }
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
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
    localStorage.clear();
    navigate("/thank-you");
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
        const response = await axiosInstance.get("/vaccine/showInfo");
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

  // Cập nhật timeline khi currentVaccineIndex thay đổi
  useEffect(() => {
    const timelineEl = document.querySelector(".vaccine-timeline-line-v4");
    if (timelineEl && vaccines.length > 0) {
      const percentage = (currentVaccineIndex / (vaccines.length - 1)) * 100;
      timelineEl.style.width = `${percentage}%`;
    }
  }, [currentVaccineIndex, vaccines.length]);

  // Thêm hàm fetch blogs
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const response = await axiosInstance.get("/blog/showBlog");
      // Lọc chỉ hiển thị các blog có trạng thái "active"
      const activeBlogs = response.data.filter(blog => blog.status === "active");
      // Lấy 3 bài blog mới nhất
      const latestBlogs = activeBlogs.slice(0, 3).map(blog => ({
        ...blog,
        views: 1000
      }));
      setBlogs(latestBlogs);
      console.log("Fetched blogs:", latestBlogs);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const toggleLike = (blogId) => {
    setLikedBlogStates(prev => ({
      ...prev,
      [blogId]: !prev[blogId]
    }));
  };

  // Thêm useEffect để fetch news
  useEffect(() => {
    fetchNews();
  }, []);

  // Thêm hàm fetch news
  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const response = await axiosInstance.post("/news/showNews", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });
      // Lọc chỉ hiển thị các news có trạng thái "active"
      const activeNews = response.data.filter(news => news.status === "active");
      // Lấy 3 bài news mới nhất
      const latestNews = activeNews.slice(0, 3).map((news, index) => ({
        ...news,
        views: 500,
        // Gán hình ảnh theo thứ tự, nếu vượt quá số lượng hình ảnh thì lặp lại
        imageUrl: newsImages[index % newsImages.length]
      }));
      setNews(latestNews);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoadingNews(false);
    }
  };

  // Add a new function to handle opening the feedback form
  const openFeedbackForm = () => {
    if (isLoggedIn && userRole === "customer") {
      setShowFeedbackForm(true);
    } else {
      navigate("/login");
    }
  };

  // Create dropdown menu items based on user role
  const getUserMenuItems = () => {
    if (userRole === "admin") {
      return (
        <Menu>
          <Menu.Item key="admin" icon={<UserOutlined />}>
            <Link to="/admin">Admin</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      );
    } else if (userRole === "staff") {
      return (
        <Menu>
          <Menu.Item key="staff" icon={<UserOutlined />}>
            <Link to="/staffLayout">Quản lý KH</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            <Link to="/profile">Hồ sơ cá nhân</Link>
          </Menu.Item>
          <Menu.Item key="feedback" icon={<CommentOutlined />} onClick={openFeedbackForm}>
            Đánh giá
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      );
    }
  };

  // Add a new useEffect to fetch customer feedbacks
  useEffect(() => {
    fetchCustomerFeedbacks();
  }, []);

  // Function to fetch customer feedbacks
  const fetchCustomerFeedbacks = async () => {
    try {
      setLoadingFeedbacks(true);
      const response = await axiosInstance.get("/feedback/getAllFeedback");

      if (response.status === 200 && Array.isArray(response.data)) {
        // Sort by rating (highest first) and then take top 6
        const sortedFeedbacks = response.data
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6);

        // Fetch customer details for each feedback
        const feedbacksWithCustomerDetails = await Promise.all(
          sortedFeedbacks.map(async (feedback) => {
            try {
              const customerResponse = await axiosInstance.get(`/customer/getCustomerById/${feedback.cusId}`);
              return {
                ...feedback,
                customerName: customerResponse.data.customerName || customerResponse.data.username || "Khách hàng",
                customerAvatar: null // You can add avatar URL if available
              };
            } catch (error) {
              console.error("Error fetching customer details:", error);
              return {
                ...feedback,
                customerName: "Khách hàng",
                customerAvatar: null
              };
            }
          })
        );

        setCustomerFeedbacks(feedbacksWithCustomerDetails);
      }
    } catch (error) {
      console.error("Error fetching customer feedbacks:", error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  return (
    <div className="homepage">
      <HeaderLayouts footerRef={footerRef} />

      {/* Remove old nav section and continue with existing code */}
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
                className={`slide-content ${currentSlide === index ? "active" : ""
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
              className={`swiper-pagination-bullet ${currentSlide === index ? "active" : ""
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
        <div className="home-vaccine-types">
          <div className="home-vaccine-card">
            <img
              src="/images/vaccineInfo1.webp"
              alt="Tiêm chủng theo yêu cầu"
            />
            <h3>TIÊM CHỦNG THEO YÊU CẦU</h3>
            <a href="#" className="read-more">
              XEM THÊM
            </a>
          </div>
          <div className="home-vaccine-card">
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
                  className={`vaccine-card-item-v1 ${displayPosition === 0 ? "center" : ""
                    }`}
                  style={{
                    transform: `translateX(${displayPosition * 150
                      }px) translateZ(${displayPosition === 0 ? 0 : -100
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
                        vaccine.vaccineImports.length > 0 &&
                        vaccine.vaccineImports[0].totalPrice
                        ? `${vaccine?.vaccineImports[0]?.totalPrice.toLocaleString()} VNĐ`
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
          {loadingNews ? (
            <div className="loading-spinner">Đang tải tin tức...</div>
          ) : news.length > 0 ? (
            news.map((newsItem, index) => (
              <div className="news-item" key={newsItem._id}>
                <div className="news-image">
                  <img src={newsItem.imageUrl} alt={`Tin tức ${index + 1}`} />
                </div>
                <div className="news-content">
                  <h3>{newsItem.newsTitle}</h3>
                  <p>
                    {newsItem.newsContent.length > 150
                      ? `${newsItem.newsContent.substring(0, 150)}...`
                      : newsItem.newsContent}
                  </p>
                  <Link to="/news" className="read-more">
                    XEM THÊM
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-news">Không có tin tức nào.</div>
          )}
        </div>
      </div>

      {/* Thêm phần hiển thị blog trước footer */}
      <section className="blog-section">
        <div className="blog-container">
          <h2 className="section-title">Bài Viết Mới Nhất</h2>
          <div className="blog-container">
            <div className="blog-grid">
              {blogs.map((blog, index) => (
                <div className="blog-card" key={blog._id}>
                  <div className="blog-image">
                    <img
                      src={blog.imageUrl || "/images/blog1.png"}
                      alt={blog.blogTitle}
                    />
                  </div>
                  <div className="blog-content">
                    <h3>{blog.blogTitle}</h3>
                    <p className="blog-excerpt">
                      {blog.blogContent.length > 150
                        ? `${blog.blogContent.substring(0, 150)}...`
                        : blog.blogContent}
                    </p>
                    <div className="blog-meta">
                      <span className="blog-author">Tác giả: {blog.author}</span>
                      <span className="blog-date">Ngày: {new Date(blog.createDate).toLocaleDateString()}</span>
                    </div>
                    <div className="blog-actions">
                      <span
                        className={`like-button ${likedBlogStates[blog._id] ? 'liked' : ''}`}
                        onClick={() => toggleLike(blog._id)}
                      >
                        {likedBlogStates[blog._id] ? <HeartFilled /> : <HeartOutlined />}
                      </span>
                      <span className="comment-icon"><CommentOutlined /></span>
                      <span className="share-icon"><ShareAltOutlined /></span>
                      <span className="views-count">
                        <EyeOutlined /> 1000
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-blogs">
              <Link to="/blogs" className="view-all-button">
                Xem tất cả bài viết
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Add Customer Feedback Section */}
      <section className="feedback-section">
        <div className="feedback-container">
          <h2>ĐÁNH GIÁ TỪ KHÁCH HÀNG</h2>
          <div className="feedback-container">
            {loadingFeedbacks ? (
              <div className="loading-spinner">Đang tải đánh giá...</div>
            ) : customerFeedbacks.length > 0 ? (
              <Carousel
                autoplay
                dots={true}
                autoplaySpeed={5000}
                className="feedback-carousel"
              >
                {/* Group feedbacks in pairs for desktop view */}
                {Array(Math.ceil(customerFeedbacks.length / 2)).fill().map((_, index) => (
                  <div key={index} className="feedback-slide">
                    <div className="feedback-row">
                      {customerFeedbacks.slice(index * 2, index * 2 + 2).map((feedback) => (
                        <div key={feedback._id} className="feedback-card">
                          <div className="feedback-card-inner">
                            <div className="feedback-quote">
                              <FaQuoteLeft className="quote-icon left" />
                              <p>{feedback.comment || "Dịch vụ rất tốt!"}</p>
                              <FaQuoteRight className="quote-icon right" />
                            </div>
                            <div className="feedback-rating">
                              <Rate disabled defaultValue={feedback.rating} />
                            </div>
                            <div className="feedback-customer">
                              <Avatar
                                size={50}
                                icon={<UserOutlined />}
                                src={feedback.customerAvatar}
                                style={{ backgroundColor: '#1890ff' }}
                              />
                              <div className="feedback-customer-info">
                                <h4>{feedback.customerName}</h4>
                                <p>Khách hàng</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="no-feedback">
                <p>Chưa có đánh giá nào.</p>
                {isLoggedIn && userRole === "customer" && (
                  <button className="feedback-button" onClick={openFeedbackForm}>
                    Hãy là người đầu tiên đánh giá
                  </button>
                )}
              </div>
            )}

            {isLoggedIn && userRole === "customer" && customerFeedbacks.length > 0 && (
              <div className="feedback-action">
                <button className="feedback-button" onClick={openFeedbackForm}>
                  <FaCommentAlt /> Thêm đánh giá của bạn
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

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
              {isLoggedIn && userRole === "customer" && (
                <Link to="#" onClick={openFeedbackForm}>Đánh giá dịch vụ</Link>
              )}
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

      {/* Floating feedback button for customers */}
      {isLoggedIn && userRole === "customer" && (
        <button
          className="feedback-floating-button"
          onClick={openFeedbackForm}
          aria-label="Đánh giá dịch vụ"
        >
          <FaCommentAlt />
          <span>Đánh giá</span>
        </button>
      )}

      {/* Feedback Form Modal */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
    </div>
  );
};

export default HomePage;