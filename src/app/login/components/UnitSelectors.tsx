import { Select } from "antd";
import { School, SelectOption } from "../types";
import { UNIT_LEVEL_OPTIONS } from "../utils/constants";

interface UnitSelectorsProps {
  unitLevel: string | undefined;
  setUnitLevel: (value: string | undefined) => void;
  selectedSo: string | null;
  setSelectedSo: (value: string | null) => void;
  selectedPhong: string | null;
  setSelectedPhong: (value: string | null) => void;
  selectedSchool: string | null;
  setSelectedSchool: (value: string | null) => void;
  soList: School[];
  phong: School[];
  schools: School[];
  loading: boolean;
  onSearch: (value: string) => void;
  onSoChange: (value: string) => void;
  onPhongChange: (value: string | null) => void;
  hasMore: boolean;
}

export function UnitSelectors({
  unitLevel,
  setUnitLevel,
  selectedSo,
  selectedPhong,
  selectedSchool,
  setSelectedSchool,
  soList,
  phong,
  schools,
  loading,
  onSearch,
  onSoChange,
  onPhongChange,
  hasMore,
}: UnitSelectorsProps) {
  const renderUnitOptions = () => (
    <Select
      style={{ width: "100%" }}
      allowClear
      showSearch
      value={unitLevel}
      options={UNIT_LEVEL_OPTIONS}
      placeholder="Cấp đơn vị"
      onChange={setUnitLevel}
      disabled={loading}
    />
  );

  const renderSoSelect = () => {
    if (!["02", "03", "04"].includes(unitLevel as string)) return null;

    return (
      <Select
        style={{ width: "100%" }}
        allowClear
        value={selectedSo}
        showSearch
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        placeholder="Sở"
        options={soList.map((s) => ({
          value: s.doetCode,
          label: s.name,
        }))}
        onChange={onSoChange}
        disabled={loading}
      />
    );
  };

  const renderPhongSelect = () => {
    if (!["03", "04"].includes(unitLevel as string)) return null;

    return (
      <Select
        style={{ width: "100%" }}
        allowClear
        showSearch
        value={selectedPhong}
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        placeholder="Phòng (tùy chọn)"
        options={phong.map((s) => ({
          value: s.divisionCode,
          label: s.name,
        }))}
        onChange={onPhongChange}
        disabled={loading || !selectedSo}
      />
    );
  };

  const renderSchoolSelect = () => {
    if (unitLevel === "04") {
      return (
        <Select
          style={{ width: "100%" }}
          allowClear
          showSearch
          value={selectedSchool}
          onChange={setSelectedSchool}
          placeholder="Trường"
          options={schools.map((s) => ({
            value: s.id.toString(),
            label: s.name,
          }))}
          onSearch={onSearch}
          onPopupScroll={(e) => {
            const { target } = e;
            const div = target as HTMLDivElement;
            if (
              div.scrollTop + div.offsetHeight >= div.scrollHeight - 20 &&
              !loading &&
              hasMore
            ) {
              // Remove the preventDefault() call
              if (selectedSo) {
                onSearch(""); // This will trigger loading more data
              }
            }
          }}
          disabled={!selectedSo}
          filterOption={false}
          notFoundContent={loading ? "Đang tải..." : "Không tìm thấy trường"}
          loading={loading}
          dropdownRender={(menu) => (
            <>
              {menu}
              {loading && (
                <div style={{ padding: "4px 8px", textAlign: "center" }}>
                  Đang tải thêm...
                </div>
              )}
            </>
          )}
        />
      );
    }

    if (unitLevel === "05") {
      return (
        <Select
          style={{ width: "100%" }}
          allowClear
          showSearch
          value={selectedSchool}
          onChange={setSelectedSchool}
          placeholder="Đơn vị đối tác"
          options={soList
            .filter((s) => s.groupUnitCode === "05")
            .map((s) => ({
              value: s.id.toString(),
              label: s.name,
            }))}
          disabled={loading}
        />
      );
    }

    return null;
  };

  return (
    <>
      {renderUnitOptions()}
      {renderSoSelect()}
      {renderPhongSelect()}
      {renderSchoolSelect()}
    </>
  );
}
