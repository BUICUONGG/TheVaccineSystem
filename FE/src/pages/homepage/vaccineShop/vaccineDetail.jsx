import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Syringe, Clock, AlertCircle } from 'lucide-react';
// import axiosInstance from '../../../service/api';
import './vaccineDetail.css';
import HeaderLayouts from "../../../components/layouts/header";
import axios from 'axios';

const VaccineDetail = () => {
  const [vaccine, setVaccine] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVaccineDetail = async () => {
      try {
        // Lấy vaccineId từ localStorage
        const vaccineId = localStorage.getItem('vaccineId');
        const accessToken = localStorage.getItem('accessToken');

        if (!vaccineId) {
          navigate('/pricelist');
          return;
        }

        const response = await axios.post(`http://localhost:8080/vaccine/searchVaccineB/${vaccineId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setVaccine(response.data);
        console
      } catch (error) {
        console.error("Error fetching vaccine details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccineDetail();

    // Cleanup function - xóa vaccineId khi unmount component
    return () => {
      localStorage.removeItem('vaccineId');
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="vaccine-detail-page">
      <HeaderLayouts />
      <motion.div 
        className="vaccine-detail-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="left-column">
          <motion.div 
            className="vaccine-image-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <img 
              src={vaccine?.imageUrl || '/default-vaccine.jpg'} 
              alt={vaccine?.vaccineName} 
              className="vaccine-image"
            />
          </motion.div>

          <Link to="/registerinjection" className="register-button">
            Đặt lịch ngay
          </Link>

          <motion.div 
            className="info-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="info-item">
              <AlertCircle className="info-icon" />
              <div>
                <h4>Phòng bệnh</h4>
                <p>{vaccine?.information?.[0]?.preventedDiseases || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="info-item">
              <Users className="info-icon" />
              <div>
                <h4>Đối tượng</h4>
                <p>{vaccine?.information?.[0]?.eligibleGroups || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="info-item">
              <Syringe className="info-icon" />
              <div>
                <h4>Đường dùng</h4>
                <p>{vaccine?.information?.[0]?.administrationRoute || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="info-item">
              <Clock className="info-icon" />
              <div>
                <h4>Ngày tạo</h4>
                <p>{vaccine?.createdAt || "Chưa cập nhật"}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="right-column"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="vaccine-name">{vaccine?.vaccineName}</h1>
          <div className="manufacturer-info">
            <span className="label">Nhà sản xuất:</span>
            <span className="value">{vaccine?.manufacturer}</span>
          </div>
          <div className="category-info">
            <span className="label">Danh mục:</span>
            <span className="value">{vaccine?.category}</span>
          </div>

          <div className="detail-section">
            <h2>Giới thiệu</h2>
            <p className="description">{vaccine?.description}</p>
          </div>

          <div className="detail-section">
            <h2>Thông tin tiêm chủng</h2>
            <div className="injection-info">
              {vaccine?.information?.map((info, index) => (
                <div key={index} className="info-section">
                  <div className="info-row">
                    <span className="label">Bệnh phòng ngừa:</span>
                    <span className="value">{info.preventedDiseases || "Chưa cập nhật"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Đối tượng tiêm:</span>
                    <span className="value">{info.eligibleGroups || "Chưa cập nhật"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Đường dùng:</span>
                    <span className="value">{info.administrationRoute || "Chưa cập nhật"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Lưu ý đặc biệt:</span>
                    <span className="value">{info.precautions || "Chưa cập nhật"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phản ứng sau tiêm:</span>
                    <span className="value">{info.reaction || "Chưa cập nhật"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VaccineDetail;