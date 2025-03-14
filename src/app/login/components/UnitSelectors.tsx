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
  partners: School[];
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
  partners,
  schools,
  loading,
  onSearch,
  onSoChange,
  onPhongChange,
  hasMore,
}: UnitSelectorsProps) {
  const renderUnitOptions = () => (
    <Select
      className="w-full rounded-lg border border-gray-300 p-2 text-sm hover:border-blue-500"
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
        className="w-full rounded-lg border border-gray-300 p-2 text-sm hover:border-blue-500"
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
        className="w-full rounded-lg border border-gray-300 p-2 text-sm hover:border-blue-500"
        allowClear
        showSearch
        value={selectedPhong}
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        placeholder="Phòng"
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
    if (unitLevel !== "04") return null;

    return (
      <Select
        className="w-full rounded-lg border border-gray-300 p-2 text-sm hover:border-blue-500"
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
            if (selectedSo) {
              onSearch(""); // Trigger loading more data
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
              <div className="p-2 text-center text-sm text-gray-500">
                Đang tải thêm...
              </div>
            )}
          </>
        )}
      />
    );
  };

  const renderPartnerSelect = () => {
    if (unitLevel !== "05") return null;

    return (
      <Select
        className="w-full rounded-lg border border-gray-300 p-2 text-sm hover:border-blue-500"
        allowClear
        showSearch
        value={selectedSchool}
        onChange={setSelectedSchool}
        placeholder="Đơn vị đối tác"
        options={partners.map((s) => ({
          value: s.id.toString(),
          label: s.name,
        }))}
        disabled={loading}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {renderUnitOptions()}
      {renderSoSelect()}
      {renderPhongSelect()}
      {renderSchoolSelect()}
      {renderPartnerSelect()}
    </div>
  );
}
