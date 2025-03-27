import apiClient from "./apiClient";
import { School } from "../types/schema";

interface SchoolResponse {
  data: School[];
}

export const schoolService = {
  fetchSchools: async (
    params: Record<string, string | number | null>
  ): Promise<SchoolResponse> => {
    const response = await apiClient.get("/master-data/school/list", {
      params,
    });
    return response.data?.data || { data: [] };
  },

  fetchSoList: async (): Promise<SchoolResponse> => {
    const response = await schoolService.fetchSchools({ groupUnitCode: "02" });
    return response;
  },

  fetchPartnerList: async (): Promise<SchoolResponse> => {
    const response = await schoolService.fetchSchools({ groupUnitCode: "05" });
    return response;
  },

  fetchPhongList: async (doetCode: string): Promise<SchoolResponse> => {
    if (doetCode) {
      const response = await schoolService.fetchSchools({
        doetCode,
        groupUnitCode: "03",
      });
      return response;
    }
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
    searchKey: string | "",
    skip = 0,
    take = 50
  ): Promise<SchoolResponse> => {
    if (!doetCode) {
      return { data: [] };
    }

    return schoolService.fetchSchools({
      doetCode,
      divisionCode: divisionCode || null,
      searchKey,
      skip,
      take,
      groupUnitCode: "04",
    });
  },
};
