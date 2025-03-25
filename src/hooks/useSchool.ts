"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/slices/reducer";
import {
  setUnitLevel,
  setSelectedSo,
  setSelectedPhong,
  setSelectedSchool,
  fetchSoListRequest,
  fetchPhongListRequest,
  fetchSchoolListRequest,
  fetchPartnerListRequest,
  searchSchoolsRequest,
  debouncedSearchRequest,
} from "@/redux/slices/schoolSlice";
import { useCallback } from "react";
import { School, SchoolOption } from "@/types/schema";
import { schoolService } from "@/services/schoolService";

export const useSchool = () => {
  const dispatch = useDispatch();
  const schoolState = useSelector((state: RootState) => state.school);

  const handleSetUnitLevel = useCallback(
    (level: string | undefined) => {
      dispatch(setUnitLevel(level));
    },
    [dispatch]
  );

  const handleSetSelectedSo = useCallback(
    (so: string | null) => {
      dispatch(setSelectedSo(so));
    },
    [dispatch]
  );

  const handleSetSelectedPhong = useCallback(
    (phong: string | null) => {
      dispatch(setSelectedPhong(phong));
    },
    [dispatch]
  );

  const handleSetSelectedSchool = useCallback(
    (school: School[]) => {
      dispatch(setSelectedSchool(school));
    },
    [dispatch]
  );

  const fetchSoList = useCallback(async () => {
    dispatch(fetchSoListRequest());
  }, [dispatch]);

  const fetchPhongList = useCallback(
    async (doetCode: string) => {
      dispatch(fetchPhongListRequest(doetCode));
    },
    [dispatch]
  );

  const fetchSchoolList = useCallback(
    async (
      doetCode: string | null,
      divisionCode: string | null,
      skip = 0,
      take = 50
    ) => {
      if (!doetCode) return;
      dispatch(fetchSchoolListRequest({ doetCode, divisionCode, skip, take }));
    },
    [dispatch]
  );

  const fetchPartnerList = useCallback(async () => {
    dispatch(fetchPartnerListRequest());
  }, [dispatch]);

  const searchSchools = useCallback(
    async (
      doetCode: string | null,
      divisionCode: string | null,
      keyword: string
    ) => {
      dispatch(searchSchoolsRequest({ doetCode, divisionCode, keyword }));
    },
    [dispatch]
  );

  const debouncedSearch = useCallback(
    (doetCode: string, divisionCode: string | null, keyword: string) => {
      dispatch(debouncedSearchRequest({ doetCode, divisionCode, keyword }));
    },
    [dispatch]
  );

  // Không có song song với Redux-Saga, nhưng chúng ta có thể trực tiếp gọi API từ đây
  const fetchSchoolOptions = useCallback(
    async (
      selectedSo: string,
      selectedPhong: string | null,
      searchValue: string,
      existingIds: Set<string>
    ): Promise<SchoolOption[]> => {
      try {
        const response = await schoolService.searchSchools(
          selectedSo,
          selectedPhong,
          searchValue
        );

        return (response.data || [])
          .filter((school) => !existingIds.has(school.id.toString()))
          .map((school) => ({
            key: `search_${school.id}`,
            value: school.id.toString(),
            label: school.name,
          }));
      } catch (error) {
        console.error("Error fetching school options:", error);
        return [];
      }
    },
    []
  );

  return {
    ...schoolState,
    setUnitLevel: handleSetUnitLevel,
    setSelectedSo: handleSetSelectedSo,
    setSelectedPhong: handleSetSelectedPhong,
    setSelectedSchool: handleSetSelectedSchool,
    fetchSoList,
    fetchPhongList,
    fetchSchoolList,
    fetchPartnerList,
    searchSchools,
    debouncedSearch,
    fetchSchoolOptions,
  };
};
