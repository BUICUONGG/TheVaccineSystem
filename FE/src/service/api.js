import axios from "axios";

// tạo api gốc
const API = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

const getAccessToken = () => localStorage.getItem("accessToken");

//Thêm accessToken vào req
API.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

//refreshToken lấy từ  HTTP-only cookie
const refreshToken = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/refreshToken",
      {},
      { withCredentials: true }
    );
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Refresh token thất bại, yêu cầu đăng nhập lại");
    localStorage.removeItem("accessToken");
    window.location.href = "/login"; //
    throw error;
  }
};

API.interceptors.response.use(
  async (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Token hết hạn, thử refresh...");

      try {
        const newAccessToken = await refreshToken();

        // Gửi lại request ban đầu với token mới
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return await axios(error.config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
