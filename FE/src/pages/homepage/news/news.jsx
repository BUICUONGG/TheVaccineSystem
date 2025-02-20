import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pagination, Modal } from "antd";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./news.css";

const News = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newsArticles, setNewsArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const articlesPerPage = 6;
    
  // Các danh mục tin tức
  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "vaccination", name: "Tiêm chủng" },
    { id: "health", name: "Sức khỏe" },
    { id: "covid", name: "COVID-19" },
    { id: "children", name: "Trẻ em" }
  ];

  // Mảng dữ liệu giả cho tin tức
  const mockData = [
    {
      id: 1,
      title: "Thông báo lịch tiêm chủng tháng 3/2024",
      summary: "Cập nhật lịch tiêm chủng mới nhất cho trẻ em và người lớn trong tháng 3 năm 2024. Đăng ký ngay để được ưu tiên.",
      image: "https://placehold.co/600x400",
      publishedAt: "2024-03-01",
      category: "vaccination"
    },
    {
      id: 2,
      title: "Vắc xin mới phòng COVID-19 cho trẻ em",
      summary: "WHO phê duyệt vắc xin COVID-19 phiên bản mới, an toàn và hiệu quả hơn cho trẻ em từ 5-11 tuổi.",
      image: "https://placehold.co/600x400",
      publishedAt: "2024-02-28",
      category: "covid"
    },
    {
      id: 3,
      title: "Chiến dịch tiêm chủng mở rộng 2024",
      summary: "Bộ Y tế phát động chiến dịch tiêm chủng mở rộng trên toàn quốc, miễn phí cho trẻ em dưới 5 tuổi.",
      image: "https://placehold.co/600x400",
      publishedAt: "2024-02-25",
      category: "vaccination"
    },
    {
      id: 4,
      title: "Hướng dẫn chăm sóc trẻ sau tiêm chủng",
      summary: "Các bước chăm sóc trẻ sau khi tiêm vắc xin, phòng ngừa và xử lý các phản ứng phụ thông thường.",
      image: "https://placehold.co/600x400",
      publishedAt: "2024-02-20",
      category: "health"
    },
    {
      id: 5,
      title: "Những điều cần biết về vắc xin 6 trong 1",
      summary: "Tìm hiểu về vắc xin 6 trong 1: thành phần, lợi ích, và lịch tiêm chủng khuyến cáo cho trẻ em.",
      image: "https://placehold.co/600x400",
      publishedAt: "2024-02-15",
      category: "children"
    },
    {
      id: 6,
      title: "Khai trương trung tâm tiêm chủng mới",
      summary: "Trung tâm tiêm chủng hiện đại bậc nhất khu vực được đưa vào hoạt động, đáp ứng nhu cầu tiêm chủng ngày càng cao.",
      image: "https://placehold.co/600x400",
      publishedAt: "2024-02-10",
      category: "health"
    }
  ];

  useEffect(() => {
    document.title = "Tin Tức";
    setNewsArticles(mockData);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      if (userId && accesstoken) {
        // Thêm logic logout API ở đây nếu cần
      }

      localStorage.removeItem("accesstoken");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      Modal.error({
        content: "Logout failed. Please try again.",
      });
    }
  };

  // Lọc tin tức theo danh mục và tìm kiếm
  const filteredNews = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Tính toán phân trang dựa trên filteredNews
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredNews.slice(indexOfFirstArticle, indexOfLastArticle);

  return (
    <div className="news-page">
      <header className="header-framework">
        <div className="header-content">
          <div className="header-title">
            <Link to="/homepage">
              <h1>Nhật Ký Tiêm Chủng</h1>
            </Link>
          </div>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                <img src="../icons/adminIcon.png" alt="User Avatar" className="avatar-icon" />
              </>
            ) : (
              <>
                <button className="login-btn" onClick={handleLogin}>Đăng nhập</button>
                <button className="register-btn" onClick={handleRegister}>Đăng ký</button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="news-container">
        <div className="news-header">
          <h1>Tin tức & Sự kiện</h1>
          <div className="news-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="featured-news">
          {currentArticles.length > 0 && (
            <div className="main-article">
              <img src={currentArticles[0].image} alt={currentArticles[0].title} />
              <div className="main-article-content">
                <span className="date">
                  {new Date(currentArticles[0].publishedAt).toLocaleDateString()}
                </span>
                <h2>{currentArticles[0].title}</h2>
                <p>{currentArticles[0].summary}</p>
                <button onClick={() => navigate(`/news/${currentArticles[0].id}`)}>
                  Đọc thêm <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="news-grid">
          {currentArticles.slice(1).map((article, index) => (
            <div className="news-card" key={index} onClick={() => navigate(`/news/${article.id}`)}>
              <div className="news-image">
                <img src={article.image} alt={article.title} />
                <div className="category-tag">{article.category}</div>
              </div>
              <div className="news-content">
                <span className="date">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <span className="read-more">Đọc tiếp →</span>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length > articlesPerPage && (
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={filteredNews.length}
              pageSize={articlesPerPage}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      <nav className="sub-navbar">
        <div className="nav-links">
          <a href="/homepage">Trang chủ</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Tin tức</a>
          <a href="#">Cẩm nang</a>
          <a href="#">Đăng ký tiêm</a>
        </div>
      </nav>

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

export default News;
