import { useEffect, useState } from "react";
import axiosInstance from "../../../../service/api";

function MyChild() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Danh sách con của tôi
      </h1>
      <div className="flex flex-wrap justify-center gap-6">
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
