"use client";

import { useState, useCallback, useRef } from "react";
import { School, SchoolOption } from "@/types/schema";
import { useSchool } from "./useSchool";
import { schoolService } from "@/services/schoolService";

export const useSchoolData = () => {
  const [skip, setSkip] = useState(0);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastSearchTerm, setLastSearchTerm] = useState("");
  const searchInProgress = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const take = 50; // Số lượng cố định mỗi lần lấy

  const { fetchSchoolList, fetchSchoolOptions } = useSchool();

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
          fetchSchoolList(selectedSo, selectedPhong, newSkip);
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
    [fetchSchoolList, skip, take, lastSearchTerm, shouldProcessRequest]
  );

  // Xử lý tìm kiếm đơn giản hóa theo mẫu của Ant Design
  const handleSchoolOptionsSearch = useCallback(
    async (
      searchValue: string,
      page: number = 0,
      selectedSo: string | null,
      selectedPhong: string | null
    ): Promise<SchoolOption[]> => {
      // Kiểm tra dữ liệu đầu vào
      if (!selectedSo) return [];

      // Tránh gọi API quá nhanh
      if (!shouldProcessRequest()) {
        return schoolOptions;
      }

      try {
        // Đánh dấu đang tìm kiếm
        searchInProgress.current = true;

        // Tính toán skip dựa trên trang
        const currentSkip = page * take;
        console.log(
          `Tìm kiếm trường: page=${page}, skip=${currentSkip}, keyword=${
            searchValue || ""
          }`
        );

        // Xử lý tìm kiếm rỗng
        if (!searchValue.trim()) {
          // Nếu không có từ khóa, gọi API lấy danh sách
          await fetchSchoolList(selectedSo, selectedPhong, currentSkip);

          // Chuyển đổi từ School sang SchoolOption
          return allSchools.map((school) => ({
            key: school.id.toString(),
            value: school.id.toString(),
            label: school.name,
          }));
        }

        // Ghi nhớ từ khóa tìm kiếm
        if (searchValue !== lastSearchTerm) {
          setLastSearchTerm(searchValue);
          // Reset skip khi có từ khóa mới
          if (page === 0) {
            setSkip(0);
          }
        }

        // Tìm kiếm với API
        const result = await schoolService.searchSchools(
          selectedSo,
          selectedPhong,
          searchValue,
          currentSkip,
          take
        );

        // Chuyển đổi kết quả thành options
        const options: SchoolOption[] = result.data.map((school: School) => ({
          key: school.id.toString(),
          value: school.id.toString(),
          label: school.name,
        }));

        // Lưu lại options cho lần tìm kiếm tiếp theo
        if (page === 0) {
          setSchoolOptions(options);
        } else {
          // Lọc trùng lặp khi tải thêm
          const existingValues = new Set(schoolOptions.map((o) => o.value));
          const newUniqueOptions = options.filter(
            (o) => !existingValues.has(o.value)
          );
          setSchoolOptions((prev) => [...prev, ...newUniqueOptions]);
        }

        return options;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm trường:", error);
        return [];
      } finally {
        // Đảm bảo đặt lại cờ sau khi hoàn thành
        setTimeout(() => {
          searchInProgress.current = false;
        }, 200);
      }
    },
    [
      fetchSchoolList,
      allSchools,
      schoolOptions,
      take,
      lastSearchTerm,
      shouldProcessRequest,
    ]
  );

  // Xóa bỏ trạng thái tìm kiếm và chuẩn bị tìm kiếm mới chỉ khi yêu cầu rõ ràng
  const resetSearchState = useCallback((clearSearchTerm = true) => {
    setSkip(0);
    if (clearSearchTerm) {
      setLastSearchTerm("");
    }
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
