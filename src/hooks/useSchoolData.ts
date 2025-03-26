"use client";

import { useState } from "react";
import { schoolService } from "@/services/schoolService";
import { School, SchoolOption } from "../types/schema";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchSchoolList,
  searchSchools,
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
      // Sử dụng search với pagination và luôn truyền searchKey hiện tại
      dispatch(
        searchSchools({
          doetCode: selectedSo,
          divisionCode: selectedPhong,
          keyword: searchKey, // Sử dụng searchKey từ Redux store
          skip: newSkip,
          take: 50,
        })
      );
    } else {
      // Sử dụng fetchSchoolList thông thường
      dispatch(
        fetchSchoolList({
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
        // Lưu trạng thái search
        dispatch(setSearchKey(searchValue));
        dispatch(setIsSearchMode(true));

        // Thực hiện tìm kiếm
        if (page === 0) {
          dispatch(
            searchSchools({
              doetCode: selectedSo,
              divisionCode: selectedPhong,
              keyword: searchValue,
              skip: 0,
              take: 50,
            })
          );
        }
      } else {
        // Reset trạng thái nếu không có giá trị tìm kiếm
        dispatch(setIsSearchMode(false));

        // Lấy danh sách trường thông thường
        if (page === 0) {
          dispatch(
            fetchSchoolList({
              doetCode: selectedSo,
              divisionCode: selectedPhong,
              skip: 0,
              take: 50,
            })
          );
        }
      }

      // Trả về kết quả từ API trực tiếp cho component select
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
