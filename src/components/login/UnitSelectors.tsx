import { Select, Space, Spin } from "antd";
import { School } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useSchoolStore } from "../../stores/schoolStore";
import { useAuthStore } from "../../stores/authStore";
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
    fetchSoList,
    fetchPartnerList,
    fetchSchoolList,
    totalSchools,
  } = useSchoolStore();

  const {
    selectedSchoolId,
    setSelectedSchoolId,
    isLoading: isAuthLoading,
  } = useAuthStore();

  const loading = isLoading || isAuthLoading;
  const [searchValue, setSearchValue] = useState("");

  // Initialize data on component mount
  useEffect(() => {
    if (!unitLevel) {
      setUnitLevel("04");
    } else if (unitLevel === "02" || unitLevel === "03" || unitLevel === "04") {
      fetchSoList();
    } else if (unitLevel === "05") {
      fetchPartnerList();
    }
  }, []);

  // Reset search when So or Phong changes
  useEffect(() => {
    if (selectedSo) {
      fetchSchoolList(selectedSo, selectedPhong, 0);
    }
  }, [selectedSo, selectedPhong]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      searchSchools(selectedSo, selectedPhong, value);
    } else {
      // Reset to first page when search is cleared
      fetchSchoolList(selectedSo, selectedPhong, 0);
    }
  };

  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
      !loading &&
      schoolList.length < totalSchools &&
      !searchValue
    ) {
      fetchSchoolList(selectedSo, selectedPhong, schoolList.length);
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
          onSearch={handleSearch}
          searchValue={searchValue}
          options={schoolList.map((s) => ({
            value: s.id.toString(),
            label: s.name,
          }))}
          onChange={setSelectedSchoolId}
          disabled={loading || !selectedSo}
          onPopupScroll={handlePopupScroll}
          listHeight={256}
          dropdownRender={(menu) => (
            <div>
              {menu}
              {loading && (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <Spin size="small" />
                </div>
              )}
              {schoolList.length >= totalSchools && schoolList.length > 0 && (
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
