import { Select, Space } from "antd";
import { School } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useSchoolStore } from "../../stores/schoolStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState, useCallback } from "react";
import { schoolService } from "@/services/schoolService";
import { DebounceSelect } from "@/components/common/DebounceSelect";

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
  } = useSchoolStore();

  const {
    selectedSchoolId,
    setSelectedSchoolId,
    isLoading: isAuthLoading,
  } = useAuthStore();

  const loading = isLoading || isAuthLoading;
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [showError, setShowError] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    if (!unitLevel) {
      setUnitLevel("04");
    } else setUnitLevel(unitLevel);
  }, [setUnitLevel, unitLevel]);

  // Update allSchools when schoolList changes
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
            key: `list_${s.id}`, // Add unique key prefix
            value: s.id.toString(),
            label: s.name,
          }))
        );

        return updatedSchools;
      });
      setHasMore(schoolList.length === 50);
    }
  }, [schoolList, skip]);

  // Reset pagination when So or Phong changes
  useEffect(() => {
    setSkip(0);
    setAllSchools([]);
    setSchoolOptions([]);
    setHasMore(true);
  }, [selectedSo, selectedPhong]);

  // Add effect to handle validation
  useEffect(() => {
    if (required) {
      const isValid = !(unitLevel === "04" && !selectedSchoolId);
      setShowError(!isValid);
      onValidationChange?.(isValid);
    }
  }, [selectedSchoolId, unitLevel, required, onValidationChange]);

  const loadMoreSchools = useCallback(
    async (newSkip: number) => {
      if (!selectedSo) return;

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
    [selectedSo, selectedPhong]
  );

  const fetchSchoolOptions = async (searchValue: string) => {
    if (!selectedSo) return [];

    try {
      const response = await schoolService.searchSchools(
        selectedSo,
        selectedPhong,
        searchValue
      );

      // Create a Set of existing IDs to avoid duplicates
      const existingIds = new Set(schoolOptions.map((opt) => opt.value));

      // Filter out duplicates and map to options
      return (response.data || [])
        .filter((school) => !existingIds.has(school.id.toString()))
        .map((school) => ({
          key: `search_${school.id}`, // Add unique key prefix
          label: school.name,
          value: school.id.toString(),
        }));
    } catch (error) {
      console.error("Error fetching school options:", error);
      return [];
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

  // Get initial options for DebounceSelect with selected school at the top
  const getInitialOptions = useCallback(() => {
    const selectedOption = selectedSchool?.[0] && {
      key: `selected_${selectedSchool[0].id}`, // Add unique key prefix
      value: selectedSchool[0].id.toString(),
      label: selectedSchool[0].name,
    };

    // Filter out duplicates from schoolOptions
    const uniqueOptions = schoolOptions.reduce((acc, curr) => {
      if (!acc.some((option) => option.value === curr.value)) {
        acc.push({
          ...curr,
          key: `list_${curr.value}`, // Add unique key prefix
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
            setSelectedSchoolId("");
            setSelectedSchool([]);
            setAllSchools([]);
            setSchoolOptions([]);
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
            setSelectedSchoolId("");
            setSelectedSchool([]);
            setAllSchools([]);
            setSchoolOptions([]);
          }}
          disabled={loading || !selectedSo}
        />
      )}

      {/* Trường Selector with Debounce */}
      {unitLevel === "04" && (
        <>
          <DebounceSelect
            className={`w-full ${showError ? "border-red-500" : ""}`}
            allowClear
            showSearch
            placeholder="Trường"
            value={
              selectedSchoolId
                ? {
                    label: selectedSchool?.[0]?.name || "",
                    value: selectedSchoolId,
                  }
                : null
            }
            fetchOptions={fetchSchoolOptions}
            onChange={(value) => {
              if (!value) {
                setSelectedSchoolId("");
                setSelectedSchool([]);
                return;
              }

              const selectedValue = (value as any).value;
              const selectedLabel = (value as any).label;

              setSelectedSchoolId(selectedValue);
              // Create a new school object with the selected data
              setSelectedSchool([
                {
                  id: Number(selectedValue),
                  name: selectedLabel,
                  // Add other required properties with default values if needed
                } as School,
              ]);
            }}
            disabled={loading || !selectedSo}
            onScroll={handlePopupScroll}
            initialOptions={getInitialOptions()}
            listHeight={256}
            status={showError ? "error" : undefined}
          />
          {showError && (
            <div className="text-red-500 text-sm">Vui lòng chọn trường</div>
          )}
        </>
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
