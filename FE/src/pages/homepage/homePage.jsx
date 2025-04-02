import React, { useState, useEffect, useRef } from "react";
import { FaMoneyBillWave, FaChild, FaChevronLeft, FaChevronRight, FaCommentAlt, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Rate, Carousel } from "antd";
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
  const [cusId, setCusId] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [username, setUsername] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [importProductsPrice, setImportProductsPrice] = useState({});

  const newsImages = [
    "/images/news/news1.jpeg",
    "/images/news/news2.jpg",
    "/images/news/news3.jpg",
    "/images/news/news4.webp",
  ];

  const banners = [
    {
      image: "/images/banner/banner1.png",
      title: "Đăng Ký Tiêm Chủng",
      description: "Bảo vệ sức khỏe cho bạn và gia đình",
      link: "/registerinjection",
      buttonText: "Đăng Ký Tiêm",
    },
    {
      image: "/images/banner/banner2.jpg",
      title: "Blog Sức Khỏe",
      description: "Cập nhật thông tin y tế mới nhất",
      link: "/blogs",
      buttonText: "Xem Blog",
    },
    {
      image: "/images/banner/banner3.jpg",
      title: "Tin Tức",
      description: "Cập nhập tin tức mới nhất",
      link: "/news",
      buttonText: "Xem thêm",
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

  useEffect(() => {
    //Chatbase.io
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

    return () => {
      document.head.removeChild(script);
    };
  }, []); 


  const footerRef = useRef(null);

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

  // Fetch vaccines
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

  //Fetch Blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const response = await axiosInstance.get("/blog/showBlog");
        const blogsData = response.data.blogs || [];

        const activeBlogs = blogsData.filter(blog => blog.status === "active");
        const latestBlogs = activeBlogs.slice(0, 3).map(blog => ({
          ...blog
        }));
        setBlogs(latestBlogs);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

//Fetch News
  useEffect(() => {
    fetchNews();
  }, []);
  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const response = await axiosInstance.get("/news/getAllNews", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });

      const activeNews = response.data.result.filter(news => news.status === "published");
      const latestNews = activeNews.slice(0, 3).map((news, index) => ({
        ...news,
       
        imageUrl: newsImages[index % newsImages.length]
      }));
      setNews(latestNews);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoadingNews(false);
    }
  };

  //Feedback form
  const openFeedbackForm = () => {
    if (isLoggedIn && userRole === "customer") {
      setShowFeedbackForm(true);
    } else {
      navigate("/login");
    }
  };

  //Fetch cus feedback
  useEffect(() => {
    fetchCustomerFeedbacks();
  }, []);
  const fetchCustomerFeedbacks = async () => {
    try {
      setLoadingFeedbacks(true);
      const response = await axiosInstance.get("/feedback/getAllFeedback");

      if (response.status === 200 && Array.isArray(response.data)) {
        //Sort top 6
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
                customerName: customerResponse.data.customerName 
              };
            } catch (error) {
              console.error("Error fetching customer details:", error);
              return {
                ...feedback,
                customerName: "Khách hàng",
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
                      <span className="blog-author"><strong>Tác giả:</strong> {blog.author}</span>
                    </div>
                    <div className="blog-actions">
                      <span className="blog-date"><strong>Ngày:</strong> {new Date(blog.createDate).toLocaleDateString()}</span>
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
              <p>Tìm kiếm</p>
              <p>Giới thiệu</p>
              <p>Chính sách bảo mật</p>
              <p>Điều khoản dịch vụ</p>
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
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-github"></i>
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

      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
    </div>
  );
};

export default HomePage;