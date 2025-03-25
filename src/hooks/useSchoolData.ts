"use client";

import { useState, useCallback, useRef } from "react";
import { School, SchoolOption } from "@/types/schema";
import { useSchool } from "./useSchool";
import { useDispatch } from "react-redux";
import { searchSchoolsRequest } from "@/redux/slices/schoolSlice";

export const useSchoolData = () => {
  const [skip, setSkip] = useState(0);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastSearchTerm, setLastSearchTerm] = useState("");
  const searchInProgress = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const take = 50; // Số lượng cố định mỗi lần lấy

  const { fetchSchoolList, searchSchools, fetchSchoolOptions } = useSchool();
  const dispatch = useDispatch();

  // Chức năng giúp tránh gọi API quá nhiều lần
  const shouldProcessRequest = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 300) {
      // Tránh gọi API liên tục trong 300ms
      return false;
    }
    lastFetchTimeRef.current = now;
    return true;
  }, []);

  // Tải thêm trường khi cuộn
  const loadMoreSchools = useCallback(
    (
      selectedSo: string | null,
      selectedPhong: string | null,
      searchTerm = ""
    ) => {
      if (!selectedSo || searchInProgress.current || !shouldProcessRequest())
        return;

      // Tăng skip lên take đơn vị
      const newSkip = skip + take;

      // Cập nhật skip
      setSkip(newSkip);

      // Đánh dấu đang tìm kiếm
      searchInProgress.current = true;

      try {
        if (searchTerm || lastSearchTerm) {
          // Khi có từ khóa tìm kiếm, gọi API search với skip
          dispatch(
            searchSchoolsRequest({
              doetCode: selectedSo,
              divisionCode: selectedPhong,
              keyword: searchTerm || lastSearchTerm,
              skip: newSkip,
            })
          );
        } else {
          // Khi không có từ khóa, gọi API lấy danh sách với skip
          fetchSchoolList(selectedSo, selectedPhong, newSkip);
        }
      } finally {
        // Đảm bảo đặt lại cờ khi hoàn thành
        setTimeout(() => {
          searchInProgress.current = false;
        }, 500);
      }
    },
    [
      fetchSchoolList,
      skip,
      take,
      lastSearchTerm,
      dispatch,
      shouldProcessRequest,
    ]
  );

  // Xử lý tìm kiếm
  const handleSchoolOptionsSearch = useCallback(
    async (
      searchValue: string,
      page: number,
      selectedSo: string | null,
      selectedPhong: string | null
    ): Promise<SchoolOption[]> => {
      if (!selectedSo) return [];

      // Nếu đang xử lý, tránh gọi API trùng lặp
      if (searchInProgress.current) {
        return schoolOptions;
      }

      // Trường hợp 1: Tìm kiếm mới
      if (searchValue.trim() && searchValue !== lastSearchTerm) {
        if (!shouldProcessRequest()) return schoolOptions;

        setLastSearchTerm(searchValue.trim());
        searchInProgress.current = true;

        try {
          // Reset skip khi tìm kiếm mới
          setSkip(0);

          // Gọi API tìm kiếm
          dispatch(
            searchSchoolsRequest({
              doetCode: selectedSo,
              divisionCode: selectedPhong,
              keyword: searchValue,
              skip: 0,
            })
          );
        } finally {
          setTimeout(() => {
            searchInProgress.current = false;
          }, 500);
        }
        return schoolOptions;
      }
      // Trường hợp 2: Cuộn với tìm kiếm hiện tại
      else if ((searchValue.trim() || lastSearchTerm) && page > 0) {
        if (!shouldProcessRequest()) return schoolOptions;

        // Tải thêm dữ liệu với từ khóa đang tìm kiếm
        searchInProgress.current = true;
        const newSkip = skip + take;

        try {
          setSkip(newSkip);
          dispatch(
            searchSchoolsRequest({
              doetCode: selectedSo,
              divisionCode: selectedPhong,
              keyword: searchValue || lastSearchTerm,
              skip: newSkip,
            })
          );
        } finally {
          setTimeout(() => {
            searchInProgress.current = false;
          }, 500);
        }
        return schoolOptions;
      }
      // Trường hợp 3: Phân trang không có tìm kiếm
      else if (page > 0) {
        if (!shouldProcessRequest()) return schoolOptions;

        // Tải thêm dữ liệu khi cuộn xuống (không có search term)
        searchInProgress.current = true;
        const newSkip = skip + take;

        try {
          setSkip(newSkip);
          // Gọi API lấy danh sách với skip
          fetchSchoolList(selectedSo, selectedPhong, newSkip);
        } finally {
          setTimeout(() => {
            searchInProgress.current = false;
          }, 500);
        }
        return schoolOptions;
      }
      // Trường hợp 4: Lần đầu mở dropdown
      else {
        // Lần đầu mở dropdown (page = 0, không có search term)
        if (skip !== 0) {
          // Reset skip nếu đây là lần đầu mở dropdown nhưng skip không phải là 0
          setSkip(0);
        }

        // Reset search term
        if (lastSearchTerm) {
          setLastSearchTerm("");
        }

        // Nếu chưa có dữ liệu, gọi API lấy dữ liệu ban đầu
        if (
          schoolOptions.length === 0 &&
          !searchInProgress.current &&
          shouldProcessRequest()
        ) {
          searchInProgress.current = true;
          try {
            fetchSchoolList(selectedSo, selectedPhong, 0);
          } finally {
            setTimeout(() => {
              searchInProgress.current = false;
            }, 500);
          }
        }

        // Trả về schoolOptions hiện tại
        return schoolOptions;
      }
    },
    [
      searchSchools,
      fetchSchoolList,
      schoolOptions,
      skip,
      take,
      lastSearchTerm,
      dispatch,
      shouldProcessRequest,
    ]
  );

  // Xóa bỏ trạng thái tìm kiếm và chuẩn bị tìm kiếm mới
  const resetSearchState = useCallback(() => {
    setSkip(0);
    setLastSearchTerm("");
    setHasMore(true);
    searchInProgress.current = false;
  }, []);

  return {
    skip,
    setSkip,
    allSchools,
    setAllSchools,
    schoolOptions,
    setSchoolOptions,
    hasMore,
    setHasMore,
    loadMoreSchools,
    handleSchoolOptionsSearch,
    fetchOptions: fetchSchoolOptions,
    lastSearchTerm,
    isSearching: () => searchInProgress.current,
    resetSearchState,
  };
};
