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
    selectedSo: string | null,
    selectedPhong: string | null
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
    selectedSo: string | null,
    selectedPhong: string | null,
    fetchSchoolOptionsFromStore: (
      selectedSo: string,
      selectedPhong: string | null,
      searchValue: string,
      existingIds: Set<string>
    ) => Promise<SchoolOption[]>
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

  const handleSchoolOptionsSearch = async (
    searchValue: string,
    page = 0,
    selectedSo: string | null,
    selectedPhong: string | null
  ) => {
    const skip = page * 50;
    const response = await schoolService.searchSchools(
      selectedSo,
      selectedPhong,
      searchValue,
      skip,
      50
    );

    return response.data.map((school) => ({
      value: school.id.toString(),
      label: school.name,
    }));
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
    handleSchoolOptionsSearch,
  };
};
