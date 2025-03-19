import { Select, Space, Spin } from "antd";
import { School } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useSchoolStore } from "../../stores/schoolStore";
import { useAuthStore } from "../../stores/authStore";
import { useSchoolSearch } from "@/hooks/useSchoolSearch";
import { useEffect, useState, useCallback } from "react";
import { schoolService } from "@/services/schoolService";

export const UnitSelectors = () => {
  const {
    unitLevel,
    setUnitLevel,
    selectedSo,
    setSelectedSo,
    selectedPhong,
    setSelectedPhong,
    soList,
    phongList,
    schoolList,
    isLoading,
    setSelectedSchool,
  } = useSchoolStore();

  const {
    selectedSchoolId,
    setSelectedSchoolId,
    isLoading: isAuthLoading,
  } = useAuthStore();

  const { handleSearch: debouncedSearch, resetSearchQuery } = useSchoolSearch();
  const [searchValue, setSearchValue] = useState("");

  const loading = isLoading || isAuthLoading;
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    if (!unitLevel) {
      setUnitLevel("04");
    }
  }, [setUnitLevel, unitLevel]);

  // Update allSchools when schoolList changes
  useEffect(() => {
    if (isSearching) {
      // During search, replace the entire list
      setAllSchools(schoolList);
    } else {
      // During normal scroll, append to list
      setAllSchools((prev) => {
        const newSchools = schoolList.filter(
          (school) => !prev.some((s) => s.id === school.id)
        );
        return skip === 0 ? schoolList : [...prev, ...newSchools];
      });
    }
    setHasMore(schoolList.length === 50 && !isSearching);
  }, [schoolList, skip, isSearching]);

  // Reset pagination when So or Phong changes
  useEffect(() => {
    setSkip(0);
    setAllSchools([]);
    setHasMore(true);
  }, [selectedSo, selectedPhong]);

  const loadMoreSchools = useCallback(
    async (newSkip: number) => {
      if (!selectedSo) return;
      if (searchValue.trim()) return;

      try {
        const response = await schoolService.fetchSchoolList(
          selectedSo,
          selectedPhong,
          newSkip,
          50
        );

        const schools = response.data || [];
        useSchoolStore.setState({ schoolList: schools });
        setSkip(newSkip);
      } catch (error) {
        console.error("Failed to load more schools:", error);
      }
    },
    [selectedSo, selectedPhong, searchValue]
  );

  const handleSchoolSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (value.trim()) {
        setIsSearching(true);
        debouncedSearch(selectedSo || "", selectedPhong || "", value);
      } else {
        setIsSearching(false);
        loadMoreSchools(0);
      }
    },
    [selectedSo, selectedPhong, debouncedSearch, loadMoreSchools]
  );

  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      if (
        target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
        !loading &&
        hasMore
      ) {
        loadMoreSchools(skip + 50);
      }
    },
    [loading, hasMore, skip, loadMoreSchools]
  );

  const handleDropdownVisibleChange = (open: boolean) => {
    setIsDropdownOpen(open);
    if (!open) {
      setSearchValue("");
      setIsSearching(false);
      resetSearchQuery();
      loadMoreSchools(0);
    }
  };

  return (
    <Space direction="vertical" className="w-full">
      {/* Unit Level Selector */}
      <Select
        className="w-full"
        placeholder="Cấp đơn vị"
        value={unitLevel}
        options={UNIT_LEVEL_OPTIONS}
        onChange={setUnitLevel}
        disabled={loading}
      />

      {/* Sở Selector */}
      {(unitLevel === "02" || unitLevel === "03" || unitLevel === "04") && (
        <Select
          className="w-full"
          allowClear
          showSearch
          placeholder="Sở"
          value={selectedSo}
          options={soList.map((s) => ({ value: s.doetCode, label: s.name }))}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(value) => {
            setSelectedSo(value);
            setSelectedSchoolId(null);
          }}
          disabled={loading}
        />
      )}

      {/* Phòng Selector */}
      {(unitLevel === "03" || unitLevel === "04") && (
        <Select
          className="w-full"
          allowClear
          showSearch
          placeholder="Phòng"
          value={selectedPhong}
          options={phongList.map((s) => ({
            value: s.divisionCode,
            label: s.name,
          }))}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(value) => {
            setSelectedPhong(value);
            setSelectedSchoolId(null);
          }}
          disabled={loading || !selectedSo}
        />
      )}

      {/* Trường Selector with Infinite Scroll */}
      {unitLevel === "04" && (
        <Select
          className="w-full"
          allowClear
          showSearch
          placeholder="Trường"
          value={selectedSchoolId}
          onSearch={handleSchoolSearch}
          searchValue={searchValue}
          onChange={(value) => {
            setSelectedSchoolId(value);
            const selectedSchools = allSchools.filter(
              (school) => school.id.toString() === value
            );
            setSelectedSchool(selectedSchools);
            resetSearchQuery();
          }}
          onClear={() => {
            setSearchValue("");
            resetSearchQuery();
            loadMoreSchools(0);
          }}
          disabled={loading || !selectedSo}
          onPopupScroll={handlePopupScroll}
          listHeight={256}
          filterOption={false}
          options={allSchools.map((s) => ({
            value: s.id.toString(),
            label: s.name,
          }))}
          notFoundContent={loading ? <Spin size="small" /> : "Không tìm thấy"}
          dropdownRender={(menu) => (
            <div>
              {menu}
              {loading && (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <Spin size="small" />
                </div>
              )}
              {!hasMore && allSchools.length > 0 && !searchValue && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px 0",
                    color: "#999",
                  }}
                >
                  Đã hiển thị tất cả
                </div>
              )}
            </div>
          )}
          open={isDropdownOpen}
          onDropdownVisibleChange={handleDropdownVisibleChange}
        />
      )}

      {/* Đơn vị đối tác Selector */}
      {unitLevel === "05" && (
        <Select
          className="w-full"
          allowClear
          showSearch
          placeholder="Đơn vị đối tác"
          value={selectedSchoolId}
          options={schoolList.map((s) => ({
            value: s.id.toString(),
            label: s.name,
          }))}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={setSelectedSchoolId}
          disabled={loading}
        />
      )}
    </Space>
  );
};
