import React, { useMemo, useRef, useState, useEffect } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import debounce from "lodash/debounce";

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, "options" | "children"> {
  fetchOptions: (search: string) => Promise<{ value: string; label: string }[]>;
  debounceTimeout?: number;
  initialOptions?: { value: string; label: string }[];
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function DebounceSelect<
  ValueType extends { label: string; value: string } = any
>({
  fetchOptions,
  debounceTimeout = 500,
  initialOptions = [],
  onScroll,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>(
    initialOptions as ValueType[]
  );
  const fetchRef = useRef(0);
  const [searching, setSearching] = useState(false);

  // Update options when initialOptions change
  useEffect(() => {
    if (!searching) {
      setOptions(initialOptions as ValueType[]);
    }
  }, [initialOptions, searching]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFetching(true);
      setSearching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions as ValueType[]);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  // Reset options when dropdown closes
  const handleDropdownVisibleChange = (open: boolean) => {
    if (!open) {
      setSearching(false);
      setOptions(initialOptions as ValueType[]);
    }
  };

  return (
    <Select<ValueType>
      labelInValue
      filterOption={false}
      onSearch={(value) => {
        if (value) {
          debounceFetcher(value);
        } else {
          setSearching(false);
          setOptions(initialOptions as ValueType[]);
        }
      }}
      onClear={() => {
        setSearching(false);
        setOptions(initialOptions as ValueType[]);
      }}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      onPopupScroll={onScroll}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      {...props}
    />
  );
}
