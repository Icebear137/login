"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
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
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SchoolOption[]>(initialOptions);
  const [currentPage, setCurrentPage] = useState(0);
  const fetchRef = useRef(0);
  const searchTextRef = useRef<string>("");
  const loadingInitialDataRef = useRef(false);

  // Tải dữ liệu ban đầu
  const loadInitialData = useCallback(async () => {
    if (options.length === 0 && !loadingInitialDataRef.current) {
      loadingInitialDataRef.current = true;
      try {
        setFetching(true);
        const initialData = await fetchOptions("", 0);
        setOptions(initialData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      } finally {
        setFetching(false);
        loadingInitialDataRef.current = false;
      }
    }
  }, [fetchOptions, options.length]);

  // Xử lý scroll để tải thêm dữ liệu
  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (onScroll) {
        onScroll(e);
      }

      const target = e.target as HTMLDivElement;
      if (
        !fetching &&
        target.scrollTop + target.clientHeight >= target.scrollHeight - 50
      ) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);

        setFetching(true);
        fetchOptions(searchTextRef.current, nextPage)
          .then((newOptions) => {
            setOptions((prev) => {
              // Lọc ra các options không trùng lặp
              const newUniqueOptions = newOptions.filter(
                (newOpt) =>
                  !prev.some(
                    (existingOpt) => existingOpt.value === newOpt.value
                  )
              );
              return [...prev, ...newUniqueOptions];
            });
          })
          .catch((error) => {
            console.error("Lỗi khi tải thêm options:", error);
          })
          .finally(() => {
            setFetching(false);
          });
      }
    },
    [fetchOptions, currentPage, fetching, onScroll]
  );

  // Xử lý debounce search
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      // Lưu giá trị tìm kiếm
      searchTextRef.current = value;

      // Tăng fetchRef để theo dõi request mới nhất
      fetchRef.current += 1;
      const fetchId = fetchRef.current;

      // Reset page về 0 cho tìm kiếm mới
      setCurrentPage(0);

      // Xử lý tìm kiếm rỗng
      if (!value.trim()) {
        if (initialOptions.length > 0) {
          setOptions(initialOptions);
          return;
        } else {
          loadInitialData();
          return;
        }
      }

      // Bắt đầu tìm kiếm
      setFetching(true);

      fetchOptions(value, 0)
        .then((newOptions) => {
          // Kiểm tra nếu đây là request gần nhất
          if (fetchId !== fetchRef.current) {
            return;
          }
          setOptions(newOptions);
        })
        .catch((error) => {
          console.error("Lỗi khi tìm kiếm:", error);
        })
        .finally(() => {
          if (fetchId === fetchRef.current) {
            setFetching(false);
          }
        });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout, initialOptions, loadInitialData]);

  // Xử lý khi dropdown mở
  const handleDropdownVisibleChange = useCallback(
    (open: boolean) => {
      if (open && options.length === 0) {
        loadInitialData();
      }
    },
    [loadInitialData, options.length]
  );

  return (
    <Select
      allowClear
      showSearch
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      onPopupScroll={handlePopupScroll}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}
