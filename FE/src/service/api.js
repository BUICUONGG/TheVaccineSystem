import axios from "axios";

const API_URL = "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi cookie chứa refreshToken
});

// Hàm lấy accessToken từ localStorage
const getAccessToken = () => {
  const token = localStorage.getItem("accesstoken");
  console.log("Current AccessToken:", token);
  return token;
};

// Log mỗi khi gửi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Sending Request:", config);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý refresh token khi bị 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Token expired, trying to refresh...");

      try {
        const response = await axiosInstance.post("/user/refresh-token");

        const { accessToken } = response.data;
        console.log("New AccessToken:", accessToken);

        localStorage.setItem("accesstoken", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh Token Failed:", refreshError);
        localStorage.removeItem("accesstoken");
        window.location.href = "/login"; // Chuyển về trang đăng nhập
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
