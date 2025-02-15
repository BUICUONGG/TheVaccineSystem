import { Link } from 'react-router-dom';
import "./camnang.css";

function CamnangPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
                <nav className="flex gap-4">
                    <Link to="/" className="hover:text-blue-300">Trang chủ</Link>
                    <Link to="/about" className="hover:text-blue-300">Giới thiệu</Link>
                    <Link to="/vaccine-packages" className="hover:text-blue-300">Gói vắc xin</Link>
                    <Link to="/vaccination-info" className="hover:text-blue-300">Thông tin tiêm chủng</Link>
                    <Link to="/services" className="hover:text-blue-300">Dịch vụ</Link>
                    <Link to="/pricing" className="hover:text-blue-300">Bảng giá</Link>
                    <Link to="/health" className="hover:text-blue-300">Bệnh học</Link>
                    <Link to="/news" className="hover:text-blue-300">Tin tức</Link>
                </nav>
                <div className="flex items-center gap-2">
                    <button className="text-lg"></button>
                    <button className="text-lg"></button>
                    <input type="text" placeholder="🔍" className="p-1 rounded-md" />
                </div>
            </header>

            {/* Banner */}
            <section className="bg-blue-100 text-center py-10">
                <img src="/images/vaccination-banner.jpg" alt="Banner" className="mx-auto mb-4" />       
                <h1 className="text-3xl font-bold text-blue-700 mt-2">CẨM NANG TIÊM CHỦNG</h1>
            </section>

            {/* Main Content */}
            <main className="container mx-auto py-8 px-4">
                <ul className="space-y-3 text-blue-700 font-semibold">
                    <li><Link to="/schedule" className="hover:underline">» LỊCH TIÊM CHỦNG</Link></li>
                    <li><Link to="/process" className="hover:underline">» QUY TRÌNH TIÊM VẮC XIN TẠI </Link></li>
                    <li><Link to="/travel-vaccines" className="hover:underline">» TIÊM CHỦNG TRƯỚC KHI ĐI NƯỚC NGOÀI</Link></li>
                    <li><Link to="/pre-vaccination" className="hover:underline">» NHỮNG ĐIỀU CẦN BIẾT TRƯỚC KHI TIÊM CHỦNG</Link></li>
                    <li><Link to="/post-vaccination" className="hover:underline">» NHỮNG ĐIỀU CẦN BIẾT SAU KHI TIÊM CHỦNG</Link></li>
                    <li><Link to="/download-guide" className="hover:underline">» DOWNLOAD CẨM NANG TIÊM CHỦNG</Link></li>
                </ul>
            </main>

            
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
}

export default CamnangPage;
