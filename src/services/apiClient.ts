import axios from "axios";

const API_BASE_URL = "https://devgwapi.thuvien.edu.vn/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Kiểm tra status code
    const status = response.status;

    // Xử lý các trường hợp status code khác nhau
    switch (status) {
      case 200:
        return response;
      case 201:
        console.log("Tạo mới thành công");
        return response;
      case 204:
        console.log("Xóa thành công");
        return response;
      case 400:
        console.error("Yêu cầu không hợp lệ");
        return Promise.reject(response);
      case 401:
        console.error("Phiên đăng nhập đã hết hạn");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(response);
      case 403:
        console.error("Bạn không có quyền truy cập");
        return Promise.reject(response);
      case 404:
        console.error("Không tìm thấy tài nguyên");
        return Promise.reject(response);
      case 500:
        console.error("Lỗi máy chủ");
        return Promise.reject(response);
      default:
        console.error("Đã xảy ra lỗi không xác định");
        return Promise.reject(response);
    }
  },
  (error) => {
    // Xử lý các lỗi network
    if (!error.response) {
      console.error("Không thể kết nối đến máy chủ");
      return Promise.reject(error);
    }

    // Xử lý các lỗi từ API
    const status = error.response.status;
    const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi";

    switch (status) {
      case 400:
        console.error(errorMessage || "Yêu cầu không hợp lệ");
        break;
      case 401:
        console.error(errorMessage || "Phiên đăng nhập đã hết hạn");
        localStorage.removeItem("token");
        window.location.href = "/login";
        break;
      case 403:
        console.error(errorMessage || "Bạn không có quyền truy cập");
        break;
      case 404:
        console.error(errorMessage || "Không tìm thấy tài nguyên");
        break;
      case 500:
        console.error(errorMessage || "Lỗi máy chủ");
        break;
      default:
        console.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
