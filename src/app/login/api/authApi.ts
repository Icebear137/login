import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { LoginParams } from "../types";
import { LOCAL_STORAGE_KEYS } from "../utils/constants";

export async function loginUser(params: LoginParams) {
  const response = await axios.post(
    `${API_BASE_URL}/user/login-school`,
    params
  );

  const token = response.data?.data?.access_token;
  if (!token) {
    throw new Error("Không lấy được access_token");
  }

  localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.common["OrgId"] = params.schoolId.toString();

  return response.data?.data;
}
