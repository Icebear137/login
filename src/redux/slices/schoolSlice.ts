import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { School } from "@/types/schema";

export interface SchoolState {
  unitLevel: string | undefined;
  selectedSo: string | null;
  selectedPhong: string | null;
  selectedSchool: School[];
  soList: School[];
  phongList: School[];
  schoolList: School[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SchoolState = {
  unitLevel: undefined,
  selectedSo: null,
  selectedPhong: null,
  selectedSchool: [],
  soList: [],
  phongList: [],
  schoolList: [],
  isLoading: false,
  error: null,
};

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {
    setUnitLevel: (state, action: PayloadAction<string | undefined>) => {
      state.unitLevel = action.payload;
      state.schoolList = [];
    },
    setSelectedSo: (state, action: PayloadAction<string | null>) => {
      state.selectedSo = action.payload;
      state.selectedPhong = null;
      state.schoolList = [];
    },
    setSelectedPhong: (state, action: PayloadAction<string | null>) => {
      state.selectedPhong = action.payload;
      state.schoolList = [];
    },
    setSelectedSchool: (state, action: PayloadAction<School[]>) => {
      state.selectedSchool = action.payload;
    },
    fetchSoListRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSoListSuccess: (state, action: PayloadAction<School[]>) => {
      state.soList = action.payload;
      state.isLoading = false;
    },
    fetchSoListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchPhongListRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPhongListSuccess: (state, action: PayloadAction<School[]>) => {
      state.phongList = action.payload;
      state.isLoading = false;
    },
    fetchPhongListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchSchoolListRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSchoolListSuccess: (
      state,
      action: PayloadAction<{
        schools: School[];
        skip: number;
        replace: boolean;
      }>
    ) => {
      const { schools, skip, replace } = action.payload;

      if (replace) {
        state.schoolList = schools;
      } else {
        const selectedSchools = state.selectedSchool || [];
        const responseData = schools || [];

        // Filter out schools that are already in response.data
        const uniqueSelectedSchools = selectedSchools.filter(
          (selected) =>
            !responseData.some((school) => school.id === selected.id)
        );

        state.schoolList = [
          ...uniqueSelectedSchools,
          ...(skip === 0
            ? responseData
            : [...state.schoolList, ...responseData]),
        ];
      }

      state.isLoading = false;
    },
    fetchSchoolListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchPartnerListRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPartnerListSuccess: (state, action: PayloadAction<School[]>) => {
      state.schoolList = action.payload;
      state.isLoading = false;
    },
    fetchPartnerListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    searchSchoolsRequest: (
      state
      // Truyền vào các tham số để typescript hiểu kiểu dữ liệu khi gọi,
      // nhưng kiểu trả về không sử dụng tham số này
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    searchSchoolsSuccess: (
      state,
      action: PayloadAction<{
        schools: School[];
        skip: number;
      }>
    ) => {
      const { schools, skip } = action.payload;

      // Nếu là trang đầu tiên, thay thế toàn bộ danh sách
      if (skip === 0) {
        state.schoolList = schools;
      }
      // Nếu không, thêm các trường mới vào (loại bỏ trùng lặp)
      else {
        // Tạo Set lưu ID của các trường đã có
        const existingIds = new Set(
          state.schoolList.map((school) => school.id)
        );

        // Lọc ra các trường mới (không trùng lặp)
        const newSchools = schools.filter(
          (school) => !existingIds.has(school.id)
        );

        // Thêm vào danh sách hiện tại
        state.schoolList = [...state.schoolList, ...newSchools];
      }

      state.isLoading = false;
    },
    searchSchoolsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    debouncedSearchRequest: (state) => {
      state.isLoading = true;
    },
  },
});

export const {
  setUnitLevel,
  setSelectedSo,
  setSelectedPhong,
  setSelectedSchool,
  fetchSoListRequest,
  fetchSoListSuccess,
  fetchSoListFailure,
  fetchPhongListRequest,
  fetchPhongListSuccess,
  fetchPhongListFailure,
  fetchSchoolListRequest,
  fetchSchoolListSuccess,
  fetchSchoolListFailure,
  fetchPartnerListRequest,
  fetchPartnerListSuccess,
  fetchPartnerListFailure,
  searchSchoolsRequest,
  searchSchoolsSuccess,
  searchSchoolsFailure,
  debouncedSearchRequest,
} = schoolSlice.actions;

export default schoolSlice.reducer;
