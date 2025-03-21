import { Select, Space } from "antd";
import { School } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useSchoolStore } from "../../stores/schoolStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useCallback } from "react";
import { DebounceSelect } from "@/components/common/DebounceSelect";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useState } from "react";

export const UnitSelectors = ({
  required = true,
  onValidationChange,
}: {
  required?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}) => {
  const {
    unitLevel,
    setUnitLevel,
    selectedSo,
    setSelectedSo,
    selectedPhong,
    setSelectedPhong,
    schoolList,
    soList,
    phongList,
    isLoading,
    selectedSchool,
    setSelectedSchool,
    fetchSchoolOptions: fetchSchoolOptionsFromStore,
  } = useSchoolStore();

  const {
    selectedSchoolId,
    setSelectedSchoolId,
    isLoading: isAuthLoading,
  } = useAuthStore();

  const {
    skip,
    setSkip,
    hasMore,
    setHasMore,
    setAllSchools,
    schoolOptions,
    setSchoolOptions,
    loadMoreSchools: loadMoreSchoolsFromHook,
    fetchSchoolOptions: fetchSchoolOptionsFromHook,
  } = useSchoolData();

  const [showError, setShowError] = useState(false);
  const loading = isLoading || isAuthLoading;

  useEffect(() => {
    if (!unitLevel) setUnitLevel(unitLevel || undefined);
  }, [unitLevel, setUnitLevel]);

  useEffect(() => {
    if (schoolList.length > 0) {
      setAllSchools((prev) => {
        const newSchools = schoolList.filter(
          (school) => !prev.some((s) => s.id === school.id)
        );
        const updatedSchools =
          skip === 0 ? schoolList : [...prev, ...newSchools];

        setSchoolOptions(
          updatedSchools.map((s) => ({
            key: `list_${s.id}`,
            value: s.id.toString(),
            label: s.name,
          }))
        );

        return updatedSchools;
      });
      setHasMore(schoolList.length === 50);
    }
  }, [schoolList, skip]);

  useEffect(() => {
    setSkip(0);
    setAllSchools([]);
    setSchoolOptions([]);
    setHasMore(true);
  }, [selectedSo, selectedPhong]);

  useEffect(() => {
    if (required) {
      const isValid = !(
        (unitLevel === "04" && !selectedSchoolId) ||
        (unitLevel === "03" && !selectedPhong) ||
        (unitLevel === "02" && !selectedSo)
      );
      setShowError(!isValid);
      onValidationChange?.(isValid);
    }
  }, [
    selectedSchoolId,
    selectedSo,
    selectedPhong,
    unitLevel,
    required,
    onValidationChange,
  ]);

  // Add new useEffect to handle unit level changes
  useEffect(() => {
    if (unitLevel === "02" && selectedSo) {
      setSelectedSchoolId(
        soList.find((s) => s.doetCode === selectedSo)?.id?.toString() || ""
      );
    } else if (unitLevel === "03" && selectedPhong) {
      setSelectedSchoolId(
        phongList
          .find((s) => s.divisionCode === selectedPhong)
          ?.id?.toString() || ""
      );
    } else if (unitLevel === "04") {
      setSelectedSchoolId(selectedSchool?.[0]?.id?.toString() || "");
    }
  }, [unitLevel, selectedSo, selectedPhong, soList, phongList]);

  // Handlers
  const handleSoChange = (value: string) => {
    setSelectedSo(value);
    setSelectedSchool([]);
    setAllSchools([]);
    setSchoolOptions([]);

    if (unitLevel === "02") {
      setSelectedSchoolId(
        soList.find((s) => s.doetCode === value)?.id?.toString() || ""
      );
    }
  };

  const handlePhongChange = (value: string) => {
    setSelectedPhong(value);
    setSelectedSchool([]);
    setAllSchools([]);
  };

  const handleSchoolChange = (value: any) => {
    if (!value) {
      setSelectedSchoolId("");
      setSelectedSchool([]);
      return;
    }

    setSelectedSchoolId(value.value);
    setSelectedSchool([
      {
        id: Number(value.value),
        name: value.label,
      } as School,
    ]);
  };

  const handleUnitLevelChange = (value: string) => {
    setUnitLevel(value);
    if (value === "02" && selectedSo) {
      setSelectedSchoolId(
        soList.find((s) => s.doetCode === selectedSo)?.id?.toString() || ""
      );
    } else if (value === "03" && selectedPhong) {
      setSelectedSchoolId(
        phongList
          .find((s) => s.divisionCode === selectedPhong)
          ?.id?.toString() || ""
      );
    } else {
      setSelectedSchoolId(null);
    }
  };

  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
      !loading &&
      hasMore
    ) {
      loadMoreSchoolsFromHook(skip + 50, selectedSo, selectedPhong);
    }
  };

  const handleSchoolOptionsSearch = async (searchValue: string) => {
    return fetchSchoolOptionsFromHook(
      searchValue,
      selectedSo,
      selectedPhong,
      (selectedSo, selectedPhong, searchValue, existingIds) =>
        fetchSchoolOptionsFromStore(
          selectedSo,
          selectedPhong || "",
          searchValue,
          existingIds
        )
    );
  };

  const getInitialOptions = useCallback(() => {
    const selectedOption = selectedSchool?.[0] && {
      key: `selected_${selectedSchool[0].id}`,
      value: selectedSchool[0].id.toString(),
      label: selectedSchool[0].name,
    };

    const uniqueOptions = schoolOptions.reduce((acc, curr) => {
      if (!acc.some((option) => option.value === curr.value)) {
        acc.push({
          ...curr,
          key: `list_${curr.value}`,
        });
      }
      return acc;
    }, [] as typeof schoolOptions);

    return selectedOption
      ? [
          selectedOption,
          ...uniqueOptions.filter((opt) => opt.value !== selectedOption.value),
        ]
      : uniqueOptions;
  }, [schoolOptions, selectedSchool]);

  return (
    <Space direction="vertical" className="w-full">
      <Select
        className="w-full"
        placeholder="Cấp đơn vị"
        value={unitLevel}
        options={UNIT_LEVEL_OPTIONS}
        onChange={handleUnitLevelChange}
        disabled={loading}
      />

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
          onChange={handleSoChange}
          disabled={loading}
        />
      )}

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
          onChange={handlePhongChange}
          disabled={loading || !selectedSo}
        />
      )}

      {unitLevel === "04" && (
        <>
          <DebounceSelect
            className={`w-full ${showError ? "border-red-500" : ""}`}
            allowClear
            showSearch
            placeholder="Trường"
            value={
              selectedSchoolId && selectedSchool?.[0]
                ? {
                    key: `selected_${selectedSchoolId}`,
                    value: selectedSchoolId,
                    label: selectedSchool[0].name,
                  }
                : undefined
            }
            fetchOptions={handleSchoolOptionsSearch}
            onChange={handleSchoolChange}
            disabled={loading || !selectedSo}
            onScroll={handlePopupScroll}
            initialOptions={getInitialOptions()}
            listHeight={256}
          />
        </>
      )}

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
