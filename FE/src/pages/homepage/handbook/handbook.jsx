import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { Pagination, Modal } from "antd";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./handbook.css";

const Handbook = () => {
  const navigate = useNavigate();
  const [, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const guidesPerPage = 6;

  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "vaccines", name: "Loại vắc xin" },
    { id: "schedule", name: "Lịch tiêm" },
    { id: "preparation", name: "Chuẩn bị" },
    { id: "aftercare", name: "Chăm sóc sau tiêm" },
    { id: "faq", name: "Câu hỏi thường gặp" },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dữ liệu giả cho cẩm nang tiêm chủng
  const guideData = [
    {
      id: 1,
      title: "Hướng dẫn lịch tiêm chủng cho trẻ 0-24 tháng",
      description:
        "Thông tin chi tiết về các mũi tiêm cần thiết và thời điểm tiêm phù hợp cho trẻ từ 0-24 tháng tuổi.",
      icon: <FaBookOpen size={50} style={{ color: "#4A90E2" }} />,
      category: "schedule",
      featured: true,
    },
    {
      id: 2,
      title: "Các loại vắc xin cơ bản",
      description:
        "Tổng quan về các loại vắc xin phổ biến, tác dụng và đối tượng tiêm chủng phù hợp.",
      icon: <FaBookOpen size={50} style={{ color: "#4A90E2" }} />,
      category: "vaccines",
    },
    {
      id: 3,
      title: "Chuẩn bị trước khi tiêm chủng",
      description:
        "Những việc cần làm và lưu ý quan trọng trước khi đưa trẻ đi tiêm chủng.",
      icon: <FaBookOpen size={50} style={{ color: "#4A90E2" }} />,
      category: "preparation",
    },
    {
      id: 4,
      title: "Chăm sóc sau tiêm chủng",
      description:
        "Hướng dẫn chi tiết cách chăm sóc trẻ và xử lý các phản ứng phụ sau tiêm.",
      icon: <FaBookOpen size={50} style={{ color: "#4A90E2" }} />,
      category: "aftercare",
    },
    {
      id: 5,
      title: "Những câu hỏi thường gặp",
      description:
        "Giải đáp các thắc mắc phổ biến của phụ huynh về tiêm chủng cho trẻ.",
      icon: <FaBookOpen size={50} style={{ color: "#4A90E2" }} />,
      category: "faq",
    },
    {
      id: 6,
      title: "Quy trình tiêm chủng an toàn",
      description:
        "Các bước trong quy trình tiêm chủng và biện pháp đảm bảo an toàn.",
      icon: <FaBookOpen size={50} style={{ color: "#4A90E2" }} />,
      category: "preparation",
    },
  ];

  useEffect(() => {
    document.title = "Cẩm nang tiêm chủng";
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
        // Add logout API call here if needed
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

  // Lọc cẩm nang theo danh mục (không còn tìm kiếm)
  const filteredGuides = guideData.filter((guide) => {
    return selectedCategory === "all" || guide.category === selectedCategory;
  });

  // Phân trang
  const indexOfLastGuide = currentPage * guidesPerPage;
  const indexOfFirstGuide = indexOfLastGuide - guidesPerPage;
  const currentGuides = filteredGuides.slice(
    indexOfFirstGuide,
    indexOfLastGuide
  );

  // Nếu đang ở trang đầu và danh mục "all", loại bỏ mục nổi bật khỏi lưới
  const guidesToShow =
    selectedCategory === "all" && currentPage === 1
      ? currentGuides.slice(1)
      : currentGuides;

  return (
    <div className="handbook-page">
      <div className="back-home-wrapper">
        <Link to="/homepage" className="back-home">
          Back home
        </Link>
      </div>

      <div className="guide-container">
        <div className="guide-header">
          <h1>Cẩm nang tiêm chủng</h1>
          <p className="guide-subtitle">
            Thông tin và hướng dẫn chi tiết về tiêm chủng
          </p>
          <div className="guide-filters">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="category-select"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phần featured: hiển thị nếu đang ở trang đầu, danh mục "all" */}
        {selectedCategory === "all" &&
          currentPage === 1 &&
          filteredGuides.length > 0 && (
            <div className="featured-guide">
              <div className="featured-card">
                <div className="featured-content">
                  <h2>{filteredGuides[0].title}</h2>
                  <p>{filteredGuides[0].description}</p>
                  <button
                    className="featured-btn"
                    onClick={() =>
                      navigate(`/handbook/${filteredGuides[0].id}`)
                    }
                  >
                    Đọc thêm <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
                <div className="guide-icon featured-icon">
                  {filteredGuides[0].icon}
                </div>
              </div>
            </div>
          )}

        <div className="guide-grid">
          {guidesToShow.map((guide) => (
            <div key={guide.id} className="guide-card">
              <div className="guide-icon">{guide.icon}</div>
              <div className="category-tag">
                {categories.find((cat) => cat.id === guide.category)?.name}
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <button
                className="read-more-btn"
                onClick={() => navigate(`/handbook/${guide.id}`)}
              >
                Đọc thêm <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          ))}
        </div>

        {filteredGuides.length > guidesPerPage && (
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={filteredGuides.length}
              pageSize={guidesPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={false}
            />
          </div>
        )}
      </div>

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

export default Handbook;
