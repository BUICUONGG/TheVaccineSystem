import { useEffect, useState } from "react";
import axiosInstance from "../../../../service/api";
import "./MyChild.css";

function MyChild() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newChild, setNewChild] = useState({
    cusId: localStorage.getItem("cusId"),
    name: "",
    birthday: "",
    gender: "",
    healthNote: "",
  });

  const cusId = localStorage.getItem("cusId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/child/getAllChildbyCusId/${cusId}`
        );
        setChildren(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cusId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChild((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateChild = async () => {
    try {
      const response = await axiosInstance.post("/child/create", newChild);
      setChildren([...children, response.data]);
      setNewChild({
        cusId: localStorage.getItem("cusId"),
        name: "",
        birthday: "",
        gender: "",
        healthNote: "",
      });
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating child:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="mychild-container">
      <h1 className="mychild-page-title">Danh sách con của tôi</h1>

      <div>
        <button
          onClick={() => setIsCreating(true)}
          className="mychild-create-child-button"
        >
          Tạo trẻ
        </button>
      </div>

      {isCreating && (
        <div className="mychild-modal-overlay">
          <div className="mychild-modal-content">
            <h2 className="mychild-page-title">Tạo con mới</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mychild-form-group">
                <label htmlFor="name" className="mychild-form-label">Tên con</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newChild.name}
                  onChange={handleInputChange}
                  className="mychild-form-input"
                  required
                />
              </div>
              <div className="mychild-form-group">
                <label htmlFor="birthday" className="mychild-form-label">Ngày sinh</label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={newChild.birthday}
                  onChange={handleInputChange}
                  className="mychild-form-input"
                  required
                />
              </div>
              <div className="mychild-form-group">
                <label htmlFor="gender" className="mychild-form-label">Giới tính</label>
                <select
                  id="gender"
                  name="gender"
                  value={newChild.gender}
                  onChange={handleInputChange}
                  className="mychild-form-input"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>
              <div className="mychild-form-group">
                <label htmlFor="healthNote" className="mychild-form-label">Ghi chú sức khỏe</label>
                <textarea
                  id="healthNote"
                  name="healthNote"
                  value={newChild.healthNote}
                  onChange={handleInputChange}
                  className="mychild-form-input"
                ></textarea>
              </div>
              <div className="mychild-modal-buttons">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="mychild-cancel-button"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateChild}
                  className="mychild-submit-button"
                >
                  Tạo con
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mychild-children-grid">
        {children.map((child) => (
          <div key={child._id} className="mychild-child-card">
            <div className="mychild-child-avatar">
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div className="mychild-child-info">
              <h2 className="mychild-child-name">Tên con: {child.name}</h2>
              <p className="mychild-child-detail">🎂 {child.birthday}</p>
              <p className="mychild-child-detail">⚤ {child.gender}</p>
              <p className="mychild-child-detail">
                📝 {child.healthNote || "Không có"}
              </p>
            </div>
            <button className="mychild-edit-button">Chỉnh sửa</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyChild;
