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
  fetchSoListRequest,
  fetchPhongListRequest,
  fetchSchoolListRequest,
  fetchPartnerListRequest,
} from "@/redux/slices/schoolSlice";
import { setSelectedSchoolId } from "@/redux/slices/authSlice";
import { set } from "lodash";

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
  const [isMounted, setIsMounted] = useState(false);
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (unitLevel) dispatch(setUnitLevel(unitLevel));
  }, [unitLevel, isMounted, dispatch]);

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

    // Fetch related data only if value exists and unit level requires it
    if (value && (unitLevel === "03" || unitLevel === "04")) {
      dispatch(fetchPhongListRequest(value));
    }

    // Fetch school list only for unit level 04
    if (value && unitLevel === "04") {
      dispatch(
        fetchSchoolListRequest({
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
        fetchSchoolListRequest({
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
      if (selectedPhong && selectedSo) {
        dispatch(
          fetchSchoolListRequest({
            doetCode: selectedSo,
            divisionCode: selectedPhong,
            skip: 0,
            take: 50,
          })
        );
      } else if (selectedSo) {
        dispatch(
          fetchSchoolListRequest({
            doetCode: selectedSo,
            divisionCode: null,
            skip: 0,
            take: 50,
          })
        );
      }
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
    dispatch(setSelectedSchool([]));
    dispatch(setSelectedSchoolId(""));
    setAllSchools([]);
    setSchoolOptions([]);

    if (value === "02") {
      dispatch(fetchSoListRequest());
      if (selectedSo) {
        dispatch(
          setSelectedSchoolId(
            soList
              .find((s: School) => s.doetCode === selectedSo)
              ?.id?.toString() || ""
          )
        );
      }
    } else if (value === "03") {
      dispatch(fetchSoListRequest());
      if (selectedSo && selectedPhong) {
        dispatch(fetchPhongListRequest(selectedSo));
        dispatch(
          setSelectedSchoolId(
            phongList
              .find((s: School) => s.divisionCode === selectedPhong)
              ?.id?.toString() || ""
          )
        );
      }
    } else if (value === "04") {
      dispatch(fetchSoListRequest());
      if (selectedSo) {
        dispatch(fetchPhongListRequest(selectedSo));
        if (selectedPhong) {
          dispatch(
            fetchSchoolListRequest({
              doetCode: selectedSo,
              divisionCode: selectedPhong,
              skip: 0,
              take: 50,
            })
          );
        } else {
          dispatch(
            fetchSchoolListRequest({
              doetCode: selectedSo,
              divisionCode: null,
              skip: 0,
              take: 50,
            })
          );
        }
      }
    } else if (value === "05") {
      dispatch(fetchPartnerListRequest());
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

  const handleSearchEmpty = async () => {
    if (selectedSo) {
      dispatch(
        fetchSchoolListRequest({
          doetCode: selectedSo,
          divisionCode: selectedPhong || null,
          skip: 0,
          take: 50,
        })
      );
    }
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

  // Tránh render ở phía server để ngăn hydration mismatch
  if (!isMounted) {
    return null;
  }

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
            onSearchEmpty={handleSearchEmpty}
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
