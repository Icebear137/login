import { Select, Space } from "antd";
import { School } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useSchoolStore } from "../../stores/schoolStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect } from "react";

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
  } = useSchoolStore();

  const {
    selectedSchoolId,
    setSelectedSchoolId,
    isLoading: isAuthLoading,
  } = useAuthStore();

  const loading = isLoading || isAuthLoading;

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

  const handleSearch = (value: string) => {
    if (value.trim()) {
      searchSchools(value);
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
          onChange={setSelectedSo}
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
          onChange={setSelectedPhong}
          disabled={loading || !selectedSo}
        />
      )}

      {/* Trường Selector */}
      {unitLevel === "04" && (
        <Select
          className="w-full"
          allowClear
          showSearch
          onSearch={handleSearch}
          placeholder="Trường"
          value={selectedSchoolId}
          options={schoolList.map((s) => ({
            value: s.id.toString(),
            label: s.name,
          }))}
          onChange={setSelectedSchoolId}
          disabled={loading || !selectedSo}
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
