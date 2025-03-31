import apiClient from "./apiClient";
import { LoginParams } from "../types/schema";

export const authService = {
  login: async (params: LoginParams) => {
    const response = await apiClient.post("/user/login-school", params);
    const token = response.data?.data?.access_token;

    if (!token) {
      throw new Error("Authentication failed");
    }

    // Set token in localStorage and axios headers
    localStorage.setItem("token", token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return token;
  },

  logout: () => {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common["Authorization"];
  },
};
