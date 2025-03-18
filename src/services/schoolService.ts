import apiClient from "./apiClient";
import { School } from "../types/schema";

interface SchoolResponse {
  data: School[];
  total: number;
}

export const schoolService = {
  fetchSchools: async (
    params: Record<string, string | number | null>
  ): Promise<SchoolResponse> => {
    const response = await apiClient.get("/master-data/school/list", {
      params,
    });
    return response.data?.data || { data: [], total: 0 };
  },

  fetchSoList: async (): Promise<School[]> => {
    const response = await schoolService.fetchSchools({ groupUnitCode: "02" });
    return response.data || [];
  },

  fetchPartnerList: async (): Promise<School[]> => {
    const response = await schoolService.fetchSchools({ groupUnitCode: "05" });
    return response.data || [];
  },

  fetchPhongList: async (doetCode: string): Promise<School[]> => {
    const response = await schoolService.fetchSchools({
      doetCode,
      groupUnitCode: "03",
    });
    return response.data || [];
  },

  fetchSchoolList: async (
    doetCode: string,
    divisionCode: string | null,
    skip = 0,
    take = 50
  ): Promise<SchoolResponse> => {
    const params: Record<string, string | number | null> = {
      doetCode,
      groupUnitCode: "04",
      skip,
      take,
    };

    if (divisionCode) {
      params.divisionCode = divisionCode;
    }

    return schoolService.fetchSchools(params);
  },

  searchSchools: async (
    doetCode: string,
    divisionCode: string | null,
    searchKey: string
  ): Promise<School[]> => {
    const response = await schoolService.fetchSchools({
      doetCode,
      divisionCode,
      searchKey,
      skip: 0,
      take: 50,
      groupUnitCode: "04",
    });
    return response.data || [];
  },
};
