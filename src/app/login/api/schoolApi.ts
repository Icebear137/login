import axios from "axios";
import { message } from "antd";
import { API_BASE_URL } from "../utils/constants";
import { School } from "../types";

export async function fetchSchools(params: Record<string, any>) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/master-data/school/list`,
      { params }
    );
    return response.data?.data || [];
  } catch (error) {
    console.error("API error:", error);
    message.error("Failed to fetch data. Please try again later.");
    return [];
  }
}

export async function fetchSoList() {
  return fetchSchools({ groupUnitCode: "02" });
}

export async function fetchPhongList(doetCode: string) {
  return fetchSchools({ doetCode, groupUnitCode: "03" });
}

export async function fetchPartnerList() {
  return fetchSchools({ groupUnitCode: "05" });
}

export async function fetchSchoolList(
  doetCode: string,
  divisionCode: string | null,
  skipCount: number,
  limit: number
) {
  const params: Record<string, any> = {
    doetCode,
    groupUnitCode: "04",
    skip: skipCount,
    take: limit,
  };

  if (divisionCode) {
    params.divisionCode = divisionCode;
  }

  return fetchSchools(params);
}

export async function searchSchools(doetCode: string, searchKey: string, limit: number) {
  return fetchSchools({
    doetCode,
    searchKey,
    skip: 0,
    take: limit,
    groupUnitCode: "04",
  });
}
