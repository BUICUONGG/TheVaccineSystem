import { useEffect, useState } from "react";
import axiosInstance from "../../../../service/api";

function MyChild() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // State để kiểm tra form tạo trẻ
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
      setIsCreating(false); // Đóng form sau khi tạo
    } catch (error) {
      console.error("Error creating child:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Danh sách con của tôi
      </h1>

      {/* Nút "Tạo trẻ" */}
      <div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-xl font-semibold rounded-lg "
        >
          Tạo trẻ
        </button>
      </div>

      {/* Modal Popup */}
      {isCreating && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-96 max-w-full">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Tạo con mới
            </h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-5">
                <label htmlFor="name" className="block text-gray-700 text-lg">
                  Tên con
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newChild.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="birthday"
                  className="block text-gray-700 text-lg"
                >
                  Ngày sinh
                </label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={newChild.birthday}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label htmlFor="gender" className="block text-gray-700 text-lg">
                  Giới tính
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={newChild.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>
              <div className="mb-5">
                <label
                  htmlFor="healthNote"
                  className="block text-gray-700 text-lg"
                >
                  Ghi chú sức khỏe
                </label>
                <textarea
                  id="healthNote"
                  name="healthNote"
                  value={newChild.healthNote}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)} // Đóng modal
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateChild}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
                >
                  Tạo con
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6 mt-8">
        {children.map((child) => (
          <div
            key={child._id}
            className="bg-white shadow-lg rounded-2xl p-6 border w-64 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-semibold text-blue-600 mb-4">
              {child.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Tên con: {child.name}
            </h2>
            <p className="text-gray-600 text-lg">🎂 {child.birthday}</p>
            <p className="text-gray-600 text-lg">⚤ {child.gender}</p>
            <p className="text-gray-600 text-lg text-center">
              📝 {child.healthNote || "Không có"}
            </p>
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-lg">
              Chỉnh sửa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyChild;
