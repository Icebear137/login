import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { School, SchoolOption } from "@/types/schema";

export interface SchoolState {
  unitLevel: string | undefined;
  selectedSo: string | null;
  selectedPhong: string | null;
  selectedSchool: School[] | null;
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
  selectedSchool: null,
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
    fetchSchoolListRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSchoolListSuccess: (state, action: PayloadAction<School[]>) => {
      state.schoolList = action.payload;
      state.isLoading = false;
    },
    fetchSchoolListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchSoListRequest,
  fetchSoListSuccess,
  fetchSoListFailure,
  setUnitLevel,
  setSelectedSo,
  setSelectedPhong,
  fetchSchoolListRequest,
  fetchSchoolListSuccess,
  fetchSchoolListFailure,
} = schoolSlice.actions;

export default schoolSlice.reducer;
