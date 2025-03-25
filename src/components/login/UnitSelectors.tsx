"use client";

import { Select, Space, Spin } from "antd";
import { School, SchoolOption } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useSchool } from "../../hooks/useSchool";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useCallback, useMemo } from "react";
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
    fetchSchoolList,
  } = useSchool();

  const {
    selectedSchoolId,
    setSelectedSchoolId,
    isLoading: isAuthLoading,
  } = useAuth();

  const {
    skip,
    setSkip,
    hasMore,
    setHasMore,
    setAllSchools,
    schoolOptions,
    setSchoolOptions,
    handleSchoolOptionsSearch,
    isSearching,
    resetSearchState,
  } = useSchoolData();

  const [showError, setShowError] = useState(false);
  const [openSchoolDropdown, setOpenSchoolDropdown] = useState(false);
  const [openPartnerDropdown, setOpenPartnerDropdown] = useState(false);

  // Sử dụng memo để tránh tính toán lại giá trị này trong mỗi render
  const loading = useMemo(
    () => isLoading || isAuthLoading,
    [isLoading, isAuthLoading]
  );

  // Đặt cấp đơn vị khi khởi tạo
  useEffect(() => {
    if (unitLevel) setUnitLevel(unitLevel || undefined);
  }, [unitLevel, setUnitLevel]);

  // Xử lý cập nhật danh sách trường khi có dữ liệu mới
  useEffect(() => {
    if (schoolList.length > 0) {
      setAllSchools((prev) => {
        // Tối ưu việc xử lý dữ liệu để tránh tính toán quá nhiều
        let updatedSchools: School[] = [];

        if (skip === 0) {
          // Nếu là trang đầu tiên, thay thế toàn bộ danh sách
          updatedSchools = [...schoolList];
        } else {
          // Nếu không, lọc ra các trường không trùng lặp và thêm vào
          const existingIds = new Set(prev.map((s) => s.id));
          const newSchools = schoolList.filter(
            (school) => !existingIds.has(school.id)
          );
          updatedSchools = [...prev, ...newSchools];
        }

        // Cập nhật danh sách options từ schools - sử dụng map thay vì hàm phức tạp hơn
        const updatedOptions = updatedSchools.map((s) => ({
          key: `list_${s.id}`,
          value: s.id?.toString() || "",
          label: s.name,
        }));

        // Lưu các options mới
        setSchoolOptions(updatedOptions);

        return updatedSchools;
      });

      // Kiểm tra nếu còn dữ liệu để tải tiếp
      setHasMore(schoolList.length === 50);
    }
  }, [schoolList, skip, setAllSchools, setSchoolOptions, setHasMore]);

  // Reset trạng thái khi thay đổi Sở hoặc Phòng
  useEffect(() => {
    resetSearchState();
    setAllSchools([]);
    setSchoolOptions([]);
    setHasMore(true);
  }, [
    selectedSo,
    selectedPhong,
    setAllSchools,
    setSchoolOptions,
    setHasMore,
    resetSearchState,
  ]);

  // Kiểm tra tính hợp lệ của việc chọn đơn vị
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

  // Handlers
  const handleSoChange = useCallback(
    (value: string) => {
      setSelectedSo(value);
      setSelectedSchool([]);
      setAllSchools([]);
      setSchoolOptions([]);
    },
    [setSelectedSo, setSelectedSchool, setAllSchools, setSchoolOptions]
  );

  const handlePhongChange = useCallback(
    (value: string) => {
      setSelectedPhong(value);
      setSelectedSchool([]);
      setAllSchools([]);
      setSchoolOptions([]);

      // Nếu value rỗng, tức là đã clear phòng, lấy danh sách trường theo Sở
      if (!value && selectedSo && unitLevel === "04") {
        setSkip(0);
        fetchSchoolList(selectedSo, null, 0);
      }
    },
    [
      setSelectedPhong,
      setSelectedSchool,
      setAllSchools,
      setSchoolOptions,
      selectedSo,
      unitLevel,
      setSkip,
      fetchSchoolList,
    ]
  );

  const handleSchoolChange = useCallback(
    (value: SchoolOption | string | null) => {
      if (!value) {
        setSelectedSchoolId("");
        setSelectedSchool([]);
        return;
      }

      // Nếu value là object (SchoolOption)
      if (typeof value === "object") {
        setSelectedSchoolId(value.value);
        setSelectedSchool([
          {
            id: Number(value.value),
            name: value.label,
          } as School,
        ]);
      }
      // Nếu value là string (giá trị ID)
      else if (typeof value === "string") {
        // Tìm trường tương ứng trong danh sách options
        const selectedOption = schoolOptions.find((opt) => opt.value === value);
        if (selectedOption) {
          setSelectedSchoolId(value);
          setSelectedSchool([
            {
              id: Number(value),
              name: selectedOption.label,
            } as School,
          ]);
        }
      }
    },
    [setSelectedSchoolId, setSelectedSchool, schoolOptions]
  );

  const handleUnitLevelChange = useCallback(
    (value: string) => {
      setUnitLevel(value);
    },
    [setUnitLevel]
  );

  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      if (
        // Kiểm tra đã cuộn gần đến cuối chưa
        target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
        !loading &&
        hasMore
      ) {
        // Đặt dropdown open = true để đảm bảo không bị đóng khi tải dữ liệu
        if (unitLevel === "04") {
          setOpenSchoolDropdown(true);
        } else if (unitLevel === "05") {
          setOpenPartnerDropdown(true);
        }

        // Gọi API với page > 0 để kích hoạt tải thêm dữ liệu
        wrappedHandleSchoolOptionsSearch("", 1);
      }
    },
    [loading, hasMore, unitLevel, setOpenSchoolDropdown, setOpenPartnerDropdown]
  );

  // Handler khi mở/đóng dropdown của trường
  const handleSchoolDropdownVisibleChange = useCallback(
    (visible: boolean) => {
      // Không đóng dropdown nếu đang tải dữ liệu
      if (!visible && (loading || isSearching())) {
        return; // Không đóng dropdown khi đang tải
      }

      setOpenSchoolDropdown(visible);

      if (visible && !loading) {
        // Khi mở dropdown, reset và tải dữ liệu ban đầu
        setSkip(0);
        wrappedHandleSchoolOptionsSearch("", 0);
      }
    },
    [loading, isSearching, setSkip]
  );

  // Handler khi mở/đóng dropdown của đối tác
  const handlePartnerDropdownVisibleChange = useCallback(
    (visible: boolean) => {
      // Không đóng dropdown nếu đang tải dữ liệu
      if (!visible && (loading || isSearching())) {
        return; // Không đóng dropdown khi đang tải
      }

      setOpenPartnerDropdown(visible);

      if (visible && !loading) {
        // Khi mở dropdown, reset và tải dữ liệu ban đầu
        setSkip(0);
        wrappedHandleSchoolOptionsSearch("", 0);
      }
    },
    [loading, isSearching, setSkip]
  );

  // Wrap hàm search để thêm xử lý đồng bộ dropdown
  const wrappedHandleSchoolOptionsSearch = useCallback(
    async (searchValue: string, page = 0) => {
      // Đảm bảo dropdown vẫn mở khi tìm kiếm
      if (unitLevel === "04") {
        setOpenSchoolDropdown(true);
      } else if (unitLevel === "05") {
        setOpenPartnerDropdown(true);
      }

      return handleSchoolOptionsSearch(
        searchValue,
        page,
        selectedSo,
        selectedPhong
      );
    },
    [
      unitLevel,
      handleSchoolOptionsSearch,
      selectedSo,
      selectedPhong,
      setOpenSchoolDropdown,
      setOpenPartnerDropdown,
    ]
  );

  // Danh sách options ban đầu - cache để tránh tính toán lại
  const getInitialOptions = useCallback(() => {
    const selectedOption = selectedSchool?.[0] && {
      key: `selected_${selectedSchool[0].id}`,
      value: selectedSchool[0].id?.toString() || "",
      label: selectedSchool[0].name,
    };

    // Sử dụng Set để loại bỏ các option trùng lặp hiệu quả hơn
    const uniqueValues = new Set<string>();
    const uniqueOptions: SchoolOption[] = [];

    for (const option of schoolOptions) {
      if (!uniqueValues.has(option.value)) {
        uniqueValues.add(option.value);
        uniqueOptions.push({
          ...option,
          key: `list_${option.value}`,
        });
      }
    }

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

      {(unitLevel === "03" || unitLevel === "04") && selectedSo && (
        <Select
          className="w-full"
          allowClear
          showSearch
          placeholder="Phòng"
          value={selectedPhong}
          options={phongList.map((p) => ({
            value: p.divisionCode,
            label: p.name,
          }))}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={handlePhongChange}
          disabled={loading}
        />
      )}

      {unitLevel === "04" && selectedSo && (
        <DebounceSelect
          className="w-full"
          placeholder="Trường"
          value={
            selectedSchool?.[0] && {
              value: selectedSchool[0].id?.toString() || "",
              label: selectedSchool[0].name,
            }
          }
          onChange={(value: SchoolOption | null) => {
            if (!value) {
              handleSchoolChange(null);
            } else {
              handleSchoolChange(value);
            }
          }}
          open={openSchoolDropdown}
          onDropdownVisibleChange={handleSchoolDropdownVisibleChange}
          onScroll={handlePopupScroll}
          fetchOptions={wrappedHandleSchoolOptionsSearch}
          initialOptions={getInitialOptions()}
          disabled={loading}
        />
      )}

      {unitLevel === "05" && (
        <DebounceSelect
          className="w-full"
          placeholder="Đối tác"
          value={
            selectedSchool?.[0] && {
              value: selectedSchool[0].id?.toString() || "",
              label: selectedSchool[0].name,
            }
          }
          onChange={(value: SchoolOption | null) => {
            if (!value) {
              handleSchoolChange(null);
            } else {
              handleSchoolChange(value);
            }
          }}
          open={openPartnerDropdown}
          onDropdownVisibleChange={handlePartnerDropdownVisibleChange}
          onScroll={handlePopupScroll}
          fetchOptions={wrappedHandleSchoolOptionsSearch}
          initialOptions={getInitialOptions()}
          disabled={loading}
        />
      )}

      {loading && <Spin size="small" />}

      {showError && (
        <div className="text-red-500">
          Vui lòng chọn đầy đủ thông tin đơn vị
        </div>
      )}
    </Space>
  );
};
