import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaComments, FaUserMd, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Modal, Pagination } from "antd"; // Đã import Pagination từ antd
import "./advise.css";

const Advise = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("general");
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 6; 

  // Thêm state mới cho Modal đặt câu hỏi
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    topic: 'general',
    question: '',
    details: ''
  });

  // Danh sách chủ đề tư vấn
  const topics = [
    { id: "general", name: "Tư vấn chung" },
    { id: "child", name: "Tiêm chủng cho trẻ" },
    { id: "pregnant", name: "Tiêm chủng cho phụ nữ mang thai" },
  ];

  // Dữ liệu mẫu cho các câu hỏi tư vấn
  const mockQuestions = [
    {
      id: 1,
      topic: "general",
      question: "Tôi nên chuẩn bị gì trước khi đi tiêm?",
      answer: "Trước khi tiêm bạn nên: Ăn đủ bữa, Nghỉ ngơi đầy đủ, Mang theo sổ tiêm chủng",
      doctor: "BS. Nguyễn Văn A",
      date: "2024-02-20"
    },
    {
      id: 2,
      topic: "child",
      question: "Trẻ mấy tháng tuổi thì tiêm được vắc xin 6 trong 1?",
      answer: "Trẻ từ 2 tháng tuổi có thể bắt đầu tiêm vắc xin 6 trong 1.",
      doctor: "BS. Trần Thị B",
      date: "2024-02-21"
    },
    {
  id: 3,
  topic: "child",
  question: "Trẻ có nên ăn nhẹ trước khi tiêm không?",
  answer: "Trẻ nên ăn nhẹ để đảm bảo năng lượng đủ khi tiêm, tuy nhiên không ăn quá no để tránh buồn nôn.",
  doctor: "BS. Lê Thị C",
  date: "2024-03-01"
},

{
  id: 4,
  topic: "pregnant",
  question: "Phụ nữ mang thai có nên tiêm phòng không?",
  answer: "Phụ nữ mang thai cần tham khảo ý kiến bác sĩ trước khi tiêm phòng, vì một số loại vắc xin có thể không phù hợp.",
  doctor: "BS. Phạm Văn D",
  date: "2024-03-05"
,}


  ];

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLoggedIn(true);
      setQuestions(mockQuestions);
    } else {
      navigate("/login");
    }
    document.title = "Tư vấn tiêm chủng";

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accesstoken = localStorage.getItem("accesstoken");

      if (userId && accesstoken) {
        await axios.post(
          `http://localhost:8080/user/logout/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accesstoken}`,
            },
          }
        );
      }

      localStorage.removeItem("accesstoken");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      Modal.error({
        content: "Đăng xuất thất bại. Vui lòng thử lại.",
      });
    }
  };

  // Thay thế hàm handleAskQuestion hiện tại
  const handleAskQuestion = () => {
    if (!isLoggedIn) {
      Modal.warning({
        title: 'Vui lòng đăng nhập',
        content: 'Bạn cần đăng nhập để đặt câu hỏi',
        okText: 'Đóng'
      });
      return;
    }
    setIsModalVisible(true);
  };

  // Thêm các hàm xử lý form
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setNewQuestion({ topic: 'general', question: '', details: '' });
  };

  const handleSubmitQuestion = async () => {
    try {
      if (!newQuestion.question.trim()) {
        Modal.warning({
          title: 'Thiếu thông tin',
          content: 'Vui lòng nhập câu hỏi của bạn',
        });
        return;
      }

      // Giả lập API call
      const response = await axios.post(
        'http://localhost:8080/api/questions',
        newQuestion,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
          },
        }
      );

      if (response.status === 200) {
        Modal.success({
          title: 'Thành công',
          content: 'Câu hỏi của bạn đã được gửi. Bác sĩ sẽ trả lời sớm nhất!',
        });
        setIsModalVisible(false);
        setNewQuestion({ topic: 'general', question: '', details: '' });
        
        // Refresh danh sách câu hỏi
        const updatedQuestions = [...questions, {
          id: questions.length + 1,
          ...newQuestion,
          date: new Date().toISOString().split('T')[0],
          status: 'pending'
        }];
        setQuestions(updatedQuestions);
      }
    } catch (error) {
      console.error('Submit question error:', error);
      Modal.error({
        title: 'Lỗi',
        content: 'Không thể gửi câu hỏi. Vui lòng thử lại sau.',
      });
    }
  };

  // Add pagination handling
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate filtered questions
  const filteredQuestions = questions.filter(
    q => selectedTopic === "general" || q.topic === selectedTopic
  );

  // Calculate current questions to display
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  return (
    <div className="advise-page">
      <div className="back-home-wrapper">
        <Link to="/homepage" className="back-home">
          Back home
        </Link>
      </div>

      <div className="advise-container">
        <div className="advise-header">
          <h1>Tư vấn tiêm chủng</h1>
          <button className="ask-question-btn" onClick={handleAskQuestion}>
            <FaComments /> Đặt câu hỏi
          </button>
        </div>

        <div className="topic-filter">
          <label>Chọn chủ đề:</label>
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              // Khi thay đổi chủ đề, reset trang về 1
              setCurrentPage(1);
            }}
          >
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Update questions-grid section using currentQuestions */}
        <div className="questions-grid">
          {currentQuestions.map(question => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <FaUserMd className="doctor-icon" />
                <span className="doctor-name">{question.doctor}</span>
                <span className="question-date">
                  <FaCalendarAlt /> {question.date}
                </span>
              </div>
              <h3>{question.question}</h3>
              <p>{question.answer}</p>
            </div>
          ))}
        </div>

        {/* Add pagination component */}
        {filteredQuestions.length > questionsPerPage && (
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={filteredQuestions.length}
              pageSize={questionsPerPage}
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

      {/* Thêm Modal form này trước closing div */}
      <Modal
        title="Đặt câu hỏi mới"
        visible={isModalVisible}
        onOk={handleSubmitQuestion}
        onCancel={handleModalCancel}
        okText="Gửi câu hỏi"
        cancelText="Hủy"
      >
        <div className="question-form">
          <div className="form-group">
            <label>Chủ đề:</label>
            <select
              value={newQuestion.topic}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, topic: e.target.value })
              }
            >
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Câu hỏi của bạn:</label>
            <input
              type="text"
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              placeholder="Nhập câu hỏi của bạn"
            />
          </div>

          <div className="form-group">
            <label>Chi tiết bổ sung (không bắt buộc):</label>
            <textarea
              value={newQuestion.details}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, details: e.target.value })
              }
              placeholder="Thêm thông tin chi tiết nếu cần"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Advise;
