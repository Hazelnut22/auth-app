import axios from "axios";

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL ?? "http://localhost:7001",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await api.post("/app/auth/refresh");
        return api(original);
      } catch {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;