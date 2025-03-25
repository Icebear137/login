"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import debounce from "lodash/debounce";
import { SchoolOption } from "@/types/schema";

export interface DebounceSelectProps<ValueType = unknown>
  extends Omit<SelectProps<ValueType>, "options" | "children"> {
  fetchOptions: (search: string, page?: number) => Promise<SchoolOption[]>;
  debounceTimeout?: number;
  initialOptions?: SchoolOption[];
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function DebounceSelect<
  ValueType extends {
    key?: string;
    label: string;
    value: string;
  } = SchoolOption
>({
  fetchOptions,
  debounceTimeout = 500,
  initialOptions = [],
  onScroll,
  open,
  onDropdownVisibleChange,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SchoolOption[]>(initialOptions);
  const [currentPage, setCurrentPage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const fetchRef = useRef(0);
  const searchInputRef = useRef<string>("");
  const hasLoadedInitialData = useRef(false);

  // Sử dụng open từ props nếu được cung cấp, ngược lại sử dụng trạng thái nội bộ
  const isOpen = open !== undefined ? open : internalOpen;

  // Reset trạng thái tìm kiếm khi dropdown đóng
  const clearSearchState = useCallback(() => {
    setSearching(false);
    searchInputRef.current = "";
    setSearchText("");
    setCurrentPage(0);
  }, []);

  // Tải dữ liệu ban đầu khi mở dropdown
  const loadInitialOptions = useCallback(async () => {
    if ((options.length === 0 || !hasLoadedInitialData.current) && !fetching) {
      setFetching(true);
      hasLoadedInitialData.current = true;
      try {
        const initialData = await fetchOptions("", 0);
        setOptions(initialData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      } finally {
        setFetching(false);
      }
    }
  }, [fetchOptions, options.length, fetching]);

  const handleVisibleChange = useCallback(
    (visible: boolean) => {
      // Lưu trạng thái open
      if (onDropdownVisibleChange) {
        onDropdownVisibleChange(visible);
      } else {
        setInternalOpen(visible);
      }

      if (visible) {
        // Khi mở dropdown, tải dữ liệu ban đầu nếu cần
        loadInitialOptions();
      } else {
        // Reset search state khi dropdown đóng
        clearSearchState();
      }
    },
    [onDropdownVisibleChange, loadInitialOptions, clearSearchState]
  );

  // Cập nhật options khi initialOptions thay đổi và không đang tìm kiếm
  useEffect(() => {
    if (!searching && initialOptions.length > 0) {
      setOptions(initialOptions);
    }
  }, [initialOptions, searching]);

  // Tải thêm options khi cuộn
  const loadMoreOptions = useCallback(async () => {
    if (fetching) return;

    setFetching(true);
    try {
      const nextPage = currentPage + 1;
      const searchTerm = searchInputRef.current;

      const moreOptions = await fetchOptions(searchTerm, nextPage);

      setOptions((prev) => {
        // Lọc ra các options không trùng lặp
        const newOptions = moreOptions.filter(
          (newOpt) =>
            !prev.some((existingOpt) => existingOpt.value === newOpt.value)
        );
        return [...prev, ...newOptions];
      });
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Lỗi khi tải thêm options:", error);
    } finally {
      setFetching(false);
    }
  }, [fetchOptions, currentPage, fetching]);

  // Xử lý debounce search để tránh gọi API liên tục
  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string) => {
      // Lưu searchText vào biến state và ref
      setSearchText(value);
      searchInputRef.current = value;

      if (!value.trim()) {
        // Nếu search rỗng, không cần tìm kiếm
        setSearching(false);
        if (initialOptions.length > 0) {
          setOptions(initialOptions);
        }
        return;
      }

      setSearching(true);
      setCurrentPage(0);
      setFetching(true);

      const fetchId = ++fetchRef.current;

      try {
        const newOptions = await fetchOptions(value, 0);
        if (fetchId !== fetchRef.current) return;

        setOptions(newOptions);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
      } finally {
        setFetching(false);
      }
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout, initialOptions]);

  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      // Xử lý cuộn
      if (onScroll) {
        onScroll(e);
      }

      const target = e.target as HTMLDivElement;
      if (
        target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
        !fetching
      ) {
        loadMoreOptions();
      }
    },
    [onScroll, fetching, loadMoreOptions]
  );

  const handleClear = useCallback(() => {
    setSearchText("");
    searchInputRef.current = "";
    // Tải lại danh sách mặc định
    if (initialOptions.length > 0) {
      setOptions(initialOptions);
    } else {
      loadInitialOptions();
    }
  }, [initialOptions, loadInitialOptions]);

  return (
    <Select
      showSearch
      allowClear
      filterOption={false}
      onSearch={debounceFetcher}
      onPopupScroll={handlePopupScroll}
      open={isOpen}
      onDropdownVisibleChange={handleVisibleChange}
      searchValue={searchText}
      onClear={handleClear}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}
