"use client";

import { useState } from "react";
import { schoolService } from "@/services/schoolService";
import { School, SchoolOption } from "../types/schema";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchSchoolListRequest,
  searchSchoolsRequest,
  setSearchKey,
  setIsSearchMode,
} from "@/redux/slices/schoolSlice";

export const useSchoolData = () => {
  const dispatch = useAppDispatch();
  const { searchKey, isSearchMode, hasMore, currentPage, isLoading } =
    useAppSelector((state) => state.school);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);

  const loadMoreSchools = async (
    newSkip: number,
    selectedSo: string | null,
    selectedPhong: string | null
  ) => {
    if (!selectedSo || isLoading || !hasMore) return;

    if (isSearchMode && searchKey) {
      dispatch(
        searchSchoolsRequest({
          doetCode: selectedSo,
          divisionCode: selectedPhong,
          keyword: searchKey,
          skip: newSkip,
          take: 50,
        })
      );
    } else {
      dispatch(
        fetchSchoolListRequest({
          doetCode: selectedSo,
          divisionCode: selectedPhong,
          skip: newSkip,
          take: 50,
        })
      );
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
    if (!selectedSo) return [];

    try {
      if (searchValue && searchValue.trim().length > 0) {
        dispatch(setSearchKey(searchValue));
        dispatch(setIsSearchMode(true));

        const skip = page * 50;
        const response = await schoolService.searchSchools(
          selectedSo,
          selectedPhong,
          searchValue,
          skip,
          50
        );

        return response.data.map((school: School) => ({
          value: school.id.toString(),
          label: school.name,
        }));
      } else {
        dispatch(setSearchKey(""));
        dispatch(setIsSearchMode(false));

        const skip = page * 50;
        const response = await schoolService.fetchSchoolList(
          selectedSo,
          selectedPhong,
          skip,
          50
        );

        return response.data.map((school: School) => ({
          value: school.id.toString(),
          label: school.name,
        }));
      }
    } catch (error) {
      console.error("Error in handleSchoolOptionsSearch:", error);
      return [];
    }
  };

  return {
    skip: currentPage * 50,
    setSkip: () => {
      // Skip được tính toán từ currentPage nên không cần setter
    },
    hasMore,
    setHasMore: () => {
      // hasMore được quản lý trong Redux, không cần setter
    },
    allSchools,
    setAllSchools,
    schoolOptions,
    setSchoolOptions,
    loadMoreSchools,
    fetchSchoolOptions,
    handleSchoolOptionsSearch,
    searchKey,
    isSearchMode,
  };
};
