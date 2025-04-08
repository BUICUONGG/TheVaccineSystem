import { useEffect, useState } from "react";
import axiosInstance from "../../../../service/api";
import dayjs from "dayjs";
import "./MyChild.css";
import { toast } from "react-toastify";

function MyChild() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  const [newChild, setNewChild] = useState({
    name: "",
    birthday: "",
    gender: "",
    healthNote: "",
  });

  const cusId = localStorage.getItem("cusId");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axiosInstance.get(
          `/child/getAllChildbyCusId/${cusId}`
        );
        setChildren(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách trẻ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChild((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateChild = async () => {
    if (!newChild.name || !newChild.birthday || !newChild.gender) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const payload = {
        ...newChild,
        birthday: dayjs(newChild.birthday).format("DD/MM/YYYY"),
        cusId,
      };

      const response = await axiosInstance.post("/child/create", payload);

      const createdChild = {
        _id: response.data._id,
        ...payload,
      };

      setChildren((prev) => [...prev, createdChild]);
      setNewChild({ name: "", birthday: "", gender: "", healthNote: "" });
      setIsCreating(false);
      toast.success("Tạo trẻ thành công!");
    } catch (error) {
      console.error("Lỗi tạo trẻ:", error);
      toast.error("Tạo trẻ thất bại!");
    }
  };

  const handleDeleteChild = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa trẻ này?");
    if (!confirmDelete) return;
    try {
      await axiosInstance.post(`/child/deleteChild/${id}`);
      setChildren((prev) => prev.filter((child) => child._id !== id));
      toast.success("Đã xóa trẻ!");
    } catch (error) {
      console.error("Lỗi xóa trẻ:", error);
      toast.error("Xóa trẻ thất bại!");
    }
  };

  //  Khi nhấn "Cập nhật"
  const handleEditClick = (child) => {
    setEditingChild({
      ...child,
      birthday: dayjs(child.birthday, "DD/MM/YYYY").format("YYYY-MM-DD"),
    });
    setIsEditing(true);
  };

  //  Khi nhấn nút cập nhật trong modal
  const handleUpdateChild = async () => {
    try {
      const { _id, name, birthday, gender, healthNote } = editingChild;
      const payload = {
        name,
        birthday: dayjs(birthday).format("DD/MM/YYYY"),
        gender,
        healthNote,
      };

      await axiosInstance.post(`/child/update/${_id}`, payload);

      // Cập nhật trong danh sách children (không cần gọi lại API)
      setChildren((prev) =>
        prev.map((child) =>
          child._id === _id ? { ...child, ...payload, _id } : child
        )
      );

      toast.success("Cập nhật trẻ thành công!");
      setIsEditing(false);
      setEditingChild(null);
    } catch (error) {
      console.error("Lỗi cập nhật trẻ:", error);
      toast.error("Cập nhật thất bại!");
    }
  };

  const getToday = () => dayjs().format("YYYY-MM-DD");

  if (loading) return <p className="text-center text-gray-500">Đang tải...</p>;

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
                <label className="mychild-form-label">Tên con *</label>
                <input
                  type="text"
                  name="name"
                  value={newChild.name}
                  onChange={handleInputChange}
                  className="mychild-form-input"
                  required
                />
              </div>
              <div className="mychild-form-group">
                <label className="mychild-form-label">Ngày sinh *</label>
                <input
                  type="date"
                  name="birthday"
                  value={newChild.birthday}
                  onChange={handleInputChange}
                  className="mychild-form-input"
                  required
                  max={getToday()}
                />
              </div>
              <div className="mychild-form-group">
                <label className="mychild-form-label">Giới tính *</label>
                <select
                  name="gender"
                  value={newChild.gender}
                  onChange={handleInputChange}
                  className="mychild-form-input"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="mychild-form-group">
                <label className="mychild-form-label">Ghi chú sức khỏe</label>
                <textarea
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

      {isEditing && (
        <div className="mychild-modal-overlay">
          <div className="mychild-modal-content">
            <h2 className="mychild-page-title">Cập nhật thông tin trẻ</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mychild-form-group">
                <label className="mychild-form-label">Tên con *</label>
                <input
                  type="text"
                  name="name"
                  value={editingChild.name}
                  onChange={(e) =>
                    setEditingChild({ ...editingChild, name: e.target.value })
                  }
                  className="mychild-form-input"
                  required
                />
              </div>
              <div className="mychild-form-group">
                <label className="mychild-form-label">Ngày sinh *</label>
                <input
                  type="date"
                  name="birthday"
                  value={editingChild.birthday}
                  max={getToday()}
                  onChange={(e) =>
                    setEditingChild({
                      ...editingChild,
                      birthday: e.target.value,
                    })
                  }
                  className="mychild-form-input"
                  required
                />
              </div>
              <div className="mychild-form-group">
                <label className="mychild-form-label">Giới tính *</label>
                <select
                  name="gender"
                  value={editingChild.gender}
                  onChange={(e) =>
                    setEditingChild({ ...editingChild, gender: e.target.value })
                  }
                  className="mychild-form-input"
                  required
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="mychild-form-group">
                <label className="mychild-form-label">Ghi chú sức khỏe</label>
                <textarea
                  name="healthNote"
                  value={editingChild.healthNote}
                  onChange={(e) =>
                    setEditingChild({
                      ...editingChild,
                      healthNote: e.target.value,
                    })
                  }
                  className="mychild-form-input"
                ></textarea>
              </div>
              <div className="mychild-modal-buttons">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="mychild-cancel-button"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpdateChild}
                  className="mychild-submit-button"
                >
                  Cập nhật
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
              <p className="mychild-child-detail ">
                ⚤{" "}
                {child.gender === "Male"
                  ? "Nam"
                  : child.gender === "Female"
                  ? "Nữ"
                  : "Không xác định"}
              </p>
              <p className="mychild-child-detail mychild-health-note">
                Tình trạng sức khoẻ: {child.healthNote || "Không có"}
              </p>
              <div className="mychild-buttons">
                <button
                  className="btn-edit"
                  onClick={() => handleEditClick(child)}
                >
                  Cập nhật
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteChild(child._id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyChild;
