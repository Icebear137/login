import axios from "axios";
import { UserInfo } from "../types/user";

export const getUserInfo = async (token: string): Promise<UserInfo> => {
  try {
    const response = await axios.get<UserInfo>(
      "https://devgwapi.thuvien.edu.vn/v1/user/get-current-user-info",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Không thể lấy thông tin người dùng!"
      );
    }
    throw error;
  }
};
