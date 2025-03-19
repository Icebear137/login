import { Select, Space, Spin } from "antd";
import { School } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useSchoolStore } from "../../stores/schoolStore";
import { useAuthStore } from "../../stores/authStore";
import { useSchoolSearch } from "@/hooks/useSchoolSearch";
import { useEffect, useState } from "react";

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
    searchSchools,
    selectedSchool,
    setSelectedSchool,
  } = useSchoolStore();

  const {
    selectedSchoolId,
    setSelectedSchoolId,
    isLoading: isAuthLoading,
  } = useAuthStore();

  const {
    handleSearch: debouncedSearch,
    searchQuery,
    resetSearchQuery,
  } = useSchoolSearch();
  const [searchValue, setSearchValue] = useState("");

  const loading = isLoading || isAuthLoading;
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allSchools, setAllSchools] = useState<School[]>([]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (!unitLevel) {
        setUnitLevel("04");
        return;
      }
    };

    initializeData();
  }, []);

  // Update allSchools when schoolList changes
  useEffect(() => {
    if (skip === 0) {
      setAllSchools(schoolList);
    } else {
      // Avoid duplicates
      const newSchools = schoolList.filter(
        (school) => !allSchools.some((s) => s.id === school.id)
      );
      setAllSchools((prev) => [...prev, ...newSchools]);
    }
    // Set hasMore flag based on returned data count
    setHasMore(schoolList.length === 50); // 50 is the take amount
  }, [schoolList, skip]);

  // Reset pagination when So or Phong changes
  useEffect(() => {
    setSkip(0);
    setAllSchools([]);
    setHasMore(true);
  }, [selectedSo, selectedPhong]);

  const handleSchoolSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      debouncedSearch(selectedSo || "", selectedPhong || "", value);
    } else {
      // Reset to first page when search is cleared
      loadMoreSchools(0);
    }
  };

  const loadMoreSchools = async (newSkip: number) => {
    if (!selectedSo) return;

    // Don't load more if we're in search mode
    if (searchValue.trim()) return;

    // Import directly here to avoid circular dependency
    const { schoolService } = await import("../../services/schoolService");

    try {
      const response = await schoolService.fetchSchoolList(
        selectedSo,
        selectedPhong,
        newSkip,
        50
      );

      const schools = response.data || [];
      // Update school store with the loaded schools
      useSchoolStore.setState({ schoolList: schools });

      setSkip(newSkip);
      return schools.length === 50; // Return if there might be more
    } catch (error) {
      console.error("Failed to load more schools:", error);
      return false;
    }
  };

  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
      !loading &&
      hasMore
    ) {
      loadMoreSchools(skip + 50);
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
          searchValue={searchValue || searchQuery}
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
