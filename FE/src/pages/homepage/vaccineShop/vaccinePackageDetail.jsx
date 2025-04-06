import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../service/api";
import "./vaccinePackageDetail.css";
import HeaderLayouts from "../../../components/layouts/header";

const VaccinePackageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vaccinePackage, setVaccinePackage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackageDetail = async () => {
            try {
                const res = await axiosInstance.post(`/vaccinepakage/getDetailFullVaccinePakage/${id}`);
                setVaccinePackage(res.data);
            } catch (err) {
                console.error("Lỗi khi lấy chi tiết gói vaccine:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPackageDetail();
    }, [id]);

    if (loading) return <div className="vaccinepkg-loading">Đang tải thông tin gói vaccine...</div>;

    if (!vaccinePackage) {
        return (
            <div className="vaccinepkg-notfound">
                <h2>Không tìm thấy gói vaccine!</h2>
                <button onClick={() => navigate("/pricelist")}>Quay lại</button>
            </div>
        );
    }

    return (
        <div className="vaccinepkg-container">
            <HeaderLayouts />
            <div className="vaccinepkg-back-wrapper">
                <button className="vaccinepkg-back-btn" onClick={() => navigate("/pricelist")}>
                    ← Quay lại trang cửa hàng
                </button>
            </div>
            <div className="vaccinepkg-header">
                {/* Bên trái: thông tin tóm tắt */}
                <div className="vaccinepkg-summary">
                    <h2 className="summary-title">{vaccinePackage.packageName}</h2>

                    <div className="summary-vaccine-list">
                        <p><strong>Các vaccine trong gói:</strong></p>
                        <ul>
                            {vaccinePackage.vaccines.map((v, i) => (
                                <li key={i}>{v.details?.vaccineName}</li>
                            ))}
                        </ul>
                    </div>

                    <p className="summary-price">
                        <strong>Giá:</strong> {vaccinePackage.price.toLocaleString()} VNĐ
                    </p>

                    <button className="summary-btn" onClick={() => navigate("/registerinjection")}>Đặt lịch ngay</button>
                </div>

                {/* Bên phải: thông tin chi tiết */}
                <div className="vaccinepkg-right">
                    <div className="pkg-info">
                        <p><strong>Danh mục:</strong> {vaccinePackage.category}</p>
                    </div>
                    <div className="pkg-description">
                        <h3>Giới thiệu</h3>
                        <p>{vaccinePackage.description}</p>
                    </div>
                </div>
            </div>

            <div className="pkg-vaccines">
                <h3>Danh sách vaccine trong gói</h3>
                {vaccinePackage.vaccines.map((v, idx) => (
                    <div key={idx} className="pkg-vaccine-card">
                        <p><strong>Tên vaccine:</strong> {v.details?.vaccineName}</p>
                        <p><strong>Số mũi tiêm:</strong> {v.quantity}</p>
                        <p><strong>Nhà sản xuất:</strong> {v.details?.manufacturer}</p>
                        <p><strong>Mô tả:</strong> {v.details?.description}</p>

                        {v.details?.information?.length > 0 && (
                            <div className="pkg-vaccine-info">
                                <p><strong>Bệnh phòng ngừa:</strong> {v.details.information[0].preventedDiseases}</p>
                                <p><strong>Đối tượng:</strong> {v.details.information[0].eligibleGroups}</p>
                                <p><strong>Đường tiêm:</strong> {v.details.information[0].administrationRoute}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="pkg-schedule">
                <h3>Lịch tiêm</h3>
                <p>{vaccinePackage.schedule.join(" ngày, ")} ngày</p>
            </div>
        </div>
    );
};

export default VaccinePackageDetail;