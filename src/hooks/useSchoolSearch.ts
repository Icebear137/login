import { useCallback, useRef } from "react";
import { useSchoolStore } from "../stores/schoolStore";
import debounce from "lodash/debounce";

export const useSchoolSearch = () => {
  const searchQuery = useRef<string>("") || null;
  const { searchSchools: storeSearchSchools } = useSchoolStore();

  const debouncedSearch = useCallback(
    debounce(
      (
        doetCode: string | null,
        divisionCode: string | null,
        keyword: string | ""
      ) => {
        storeSearchSchools(doetCode, divisionCode, keyword);
      },
      500
    ),
    []
  );

  const handleSearch = useCallback(
    (doetCode: string | null, divisionCode: string | null, keyword: string) => {
      searchQuery.current = keyword;
      debouncedSearch(doetCode, divisionCode, keyword);
    },
    [debouncedSearch, searchQuery]
  );

  const resetSearchQuery = () => {
    searchQuery.current = "";
  };

  return {
    searchQuery: searchQuery.current,
    resetSearchQuery,
    handleSearch,
  };
};
