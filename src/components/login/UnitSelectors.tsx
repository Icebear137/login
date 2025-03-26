"use client";

import { Select, Space } from "antd";
import { School, SchoolOption } from "../../types/schema";
import { UNIT_LEVEL_OPTIONS } from "../../utils/constants";
import { useEffect, useCallback, useState } from "react";
import { DebounceSelect } from "@/components/common/DebounceSelect";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setUnitLevel,
  setSelectedSo,
  setSelectedPhong,
  setSelectedSchool,
  fetchSoList,
  fetchPhongList,
  fetchSchoolList,
  fetchPartnerList,
} from "@/redux/slices/schoolSlice";
import { setSelectedSchoolId } from "@/redux/slices/authSlice";

// Định nghĩa lại kiểu trạng thái cho Redux
interface SchoolState {
  unitLevel: string | undefined;
  selectedSo: string | null;
  selectedPhong: string | null;
  selectedSchool: School[] | null;
  soList: School[];
  phongList: School[];
  schoolList: School[];
  isLoading: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string;
  password: string;
  selectedSchoolId: string | null;
  isLoading: boolean;
}

interface AppState {
  school: SchoolState;
  auth: AuthState;
}

export const UnitSelectors = ({
  required = true,
  onValidationChange,
}: {
  required?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}) => {
  const dispatch = useAppDispatch();

  // Lấy state từ Redux
  const {
    unitLevel,
    selectedSo,
    selectedPhong,
    schoolList,
    soList,
    phongList,
    selectedSchool,
    isLoading: isSchoolLoading,
  } = useAppSelector((state) => (state as unknown as AppState).school);

  const { selectedSchoolId, isLoading: isAuthLoading } = useAppSelector(
    (state) => (state as unknown as AppState).auth
  );

  const {
    skip,
    setSkip,
    hasMore,
    setHasMore,
    setAllSchools,
    schoolOptions,
    setSchoolOptions,
    loadMoreSchools: loadMoreSchoolsFromHook,
    handleSchoolOptionsSearch,
  } = useSchoolData();

  const [showError, setShowError] = useState(false);
  const loading = isSchoolLoading || isAuthLoading;

  useEffect(() => {
    if (unitLevel) dispatch(setUnitLevel(unitLevel || undefined));
  }, []);

  useEffect(() => {
    if (schoolList.length > 0) {
      setAllSchools((prev) => {
        const newSchools = schoolList.filter(
          (school: School) => !prev.some((s: School) => s.id === school.id)
        );
        const updatedSchools =
          skip === 0 ? schoolList : [...prev, ...newSchools];

        setSchoolOptions(
          updatedSchools.map((s: School) => ({
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
      dispatch(
        setSelectedSchoolId(
          soList
            .find((s: School) => s.doetCode === selectedSo)
            ?.id?.toString() || ""
        )
      );
    } else if (unitLevel === "03" && selectedPhong) {
      dispatch(
        setSelectedSchoolId(
          phongList
            .find((s: School) => s.divisionCode === selectedPhong)
            ?.id?.toString() || ""
        )
      );
    } else if (unitLevel === "04") {
      dispatch(setSelectedSchoolId(selectedSchool?.[0]?.id?.toString() || ""));
    }
  }, [
    unitLevel,
    selectedSo,
    selectedPhong,
    soList,
    phongList,
    selectedSchool,
    dispatch,
  ]);

  // Handlers
  const handleSoChange = (value: string) => {
    dispatch(setSelectedSo(value));
    dispatch(setSelectedSchool([]));
    setAllSchools([]);
    setSchoolOptions([]);

    if (unitLevel === "02") {
      dispatch(
        setSelectedSchoolId(
          soList.find((s: School) => s.doetCode === value)?.id?.toString() || ""
        )
      );
    }

    // Fetch related data
    if (value) {
      dispatch(fetchPhongList(value));
      dispatch(
        fetchSchoolList({
          doetCode: value,
          divisionCode: null,
          skip: 0,
          take: 50,
        })
      );
    }
  };

  const handlePhongChange = (value: string) => {
    dispatch(setSelectedPhong(value));
    dispatch(setSelectedSchool([]));
    setAllSchools([]);

    // Fetch school list with phong selected
    if (selectedSo) {
      dispatch(
        fetchSchoolList({
          doetCode: selectedSo,
          divisionCode: value,
          skip: 0,
          take: 50,
        })
      );
    }
  };

  const handleSchoolChange = (value: SchoolOption | undefined) => {
    if (!value) {
      dispatch(setSelectedSchoolId(""));
      dispatch(setSelectedSchool([]));
      return;
    }

    dispatch(setSelectedSchoolId(value.value));
    dispatch(
      setSelectedSchool([
        {
          id: Number(value.value),
          name: value.label,
        } as School,
      ])
    );
  };

  const handleUnitLevelChange = (value: string) => {
    dispatch(setUnitLevel(value));

    if (value === "02") {
      dispatch(fetchSoList());
      if (selectedSo) {
        dispatch(
          setSelectedSchoolId(
            soList
              .find((s: School) => s.doetCode === selectedSo)
              ?.id?.toString() || ""
          )
        );
      } else {
        dispatch(setSelectedSchoolId(""));
      }
    } else if (value === "03") {
      dispatch(fetchSoList());
      if (selectedSo && selectedPhong) {
        dispatch(fetchPhongList(selectedSo));
        dispatch(
          setSelectedSchoolId(
            phongList
              .find((s: School) => s.divisionCode === selectedPhong)
              ?.id?.toString() || ""
          )
        );
      } else {
        dispatch(setSelectedSchoolId(""));
      }
    } else if (value === "04") {
      dispatch(fetchSoList());
      if (selectedSo) {
        dispatch(fetchPhongList(selectedSo));
        dispatch(
          fetchSchoolList({
            doetCode: selectedSo,
            divisionCode: selectedPhong,
            skip: 0,
            take: 50,
          })
        );
        if (selectedSchool?.[0]) {
          dispatch(setSelectedSchoolId(selectedSchool[0].id.toString()));
        } else {
          dispatch(setSelectedSchoolId(""));
        }
      } else {
        dispatch(setSelectedSchoolId(""));
      }
    } else if (value === "05") {
      dispatch(fetchPartnerList());
      dispatch(setSelectedSchoolId(null));
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

  const wrappedHandleSchoolOptionsSearch = async (
    searchValue: string,
    page = 0
  ) => {
    return handleSchoolOptionsSearch(
      searchValue,
      page,
      selectedSo,
      selectedPhong
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
          options={soList.map((s: School) => ({
            value: s.doetCode,
            label: s.name,
          }))}
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
          options={phongList.map((s: School) => ({
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
            fetchOptions={wrappedHandleSchoolOptionsSearch}
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
          options={schoolList.map((s: School) => ({
            value: s.id.toString(),
            label: s.name,
          }))}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(value) => dispatch(setSelectedSchoolId(value))}
          disabled={loading}
        />
      )}
    </Space>
  );
};
