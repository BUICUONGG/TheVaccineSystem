import API from "./api.js"; // Import API đã cấu hình

const testAPI = async () => {
  try {
    // Gọi API cần xác thực
    const response = await API.get("/vaccine/listVaccine");
    console.log("Dữ liệu user:", response.data);
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
  }
};

testAPI();
