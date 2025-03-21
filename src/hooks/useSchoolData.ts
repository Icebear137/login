import { useState } from "react";
import { schoolService } from "@/services/schoolService";
import { useSchoolStore } from "@/stores/schoolStore";
import { School, SchoolOption } from "../types/schema";

export const useSchoolData = () => {
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);

  const loadMoreSchools = async (
    newSkip: number,
    selectedSo: string,
    selectedPhong?: string
  ) => {
    if (!selectedSo) return;

    try {
      const response = await schoolService.fetchSchoolList(
        selectedSo,
        selectedPhong,
        newSkip,
        50
      );
      useSchoolStore.setState({ schoolList: response.data || [] });
      setSkip(newSkip);
    } catch (error) {
      console.error("Failed to load more schools:", error);
    }
  };

  const fetchSchoolOptions = async (
    searchValue: string,
    selectedSo: string,
    selectedPhong: string | undefined,
    fetchSchoolOptionsFromStore: Function
  ) => {
    if (!selectedSo) return [];
    const existingIds = new Set(schoolOptions.map((opt) => opt.value));
    return fetchSchoolOptionsFromStore(
      selectedSo,
      selectedPhong,
      searchValue,
      existingIds
    );
  };

  return {
    skip,
    setSkip,
    hasMore,
    setHasMore,
    allSchools,
    setAllSchools,
    schoolOptions,
    setSchoolOptions,
    loadMoreSchools,
    fetchSchoolOptions,
  };
};
