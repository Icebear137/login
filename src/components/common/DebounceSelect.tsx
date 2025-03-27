import React, { useMemo, useRef, useState, useEffect } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import debounce from "lodash/debounce";

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, "options" | "children"> {
  fetchOptions: (
    search: string,
    page?: number
  ) => Promise<{ value: string; label: string }[]>;
  debounceTimeout?: number;
  initialOptions?: { value: string; label: string }[];
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onSearchEmpty?: () => Promise<void>; // Add this new prop
}

export function DebounceSelect<
  ValueType extends { label: string; value: string } = any
>({
  fetchOptions,
  debounceTimeout = 500,
  initialOptions = [],
  onScroll,
  onSearchEmpty, // Add this new prop
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>(
    initialOptions as ValueType[]
  );
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const fetchRef = useRef(0);
  const [searching, setSearching] = useState(false);

  // Update options when initialOptions change
  useEffect(() => {
    if (!searching) {
      setOptions(initialOptions as ValueType[]);
    }
  }, [initialOptions, searching]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFetching(true);
      setSearching(true);
      setCurrentPage(0);

      try {
        const newOptions = await fetchOptions(value, 0);
        if (fetchId !== fetchRef.current) return;

        setOptions(newOptions as ValueType[]);
      } finally {
        setFetching(false);
      }
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const handlePopupScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
      !fetching
    ) {
      setFetching(true);
      const nextPage = currentPage + 1;
      try {
        const moreOptions = await fetchOptions(searchText, nextPage);
        if (moreOptions.length > 0) {
          setOptions((prev) => {
            // Lọc bỏ các options trùng lặp
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newUniqueOptions = moreOptions.filter(
              (opt) => !existingValues.has(opt.value)
            ) as ValueType[];

            return [...prev, ...newUniqueOptions];
          });
          setCurrentPage(nextPage);
        }
      } finally {
        setFetching(false);
      }
    } else if (onScroll) {
      onScroll(e);
    }
  };

  const clearSearchState = () => {
    setSearching(false);
    setOptions(initialOptions as ValueType[]);
    setSearchText("");
    setCurrentPage(0);
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    if (!open) {
      clearSearchState();
    }
  };

  const handleSearch = async (value: string) => {
    setSearchText(value);
    if (value) {
      debounceFetcher(value);
    } else {
      // When search text is empty
      if (onSearchEmpty) {
        await onSearchEmpty();
      }
      clearSearchState();
    }
  };

  return (
    <Select<ValueType>
      labelInValue
      filterOption={false}
      onSearch={handleSearch}
      onClear={clearSearchState}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      onPopupScroll={handlePopupScroll}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      {...props}
    />
  );
}
