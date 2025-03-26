"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { School } from "../../types/schema";
import { schoolService } from "../../services/schoolService";
import { RootState } from "../store";
import { debounce } from "lodash";
import { AppDispatch } from "../store";

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

const initialState: SchoolState = {
  unitLevel: undefined,
  selectedSo: null,
  selectedPhong: null,
  selectedSchool: [],
  soList: [],
  phongList: [],
  schoolList: [],
  isLoading: false,
};

// Async thunks
export const fetchSoList = createAsyncThunk(
  "school/fetchSoList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await schoolService.fetchSoList();
      return response.data || [];
    } catch (error) {
      console.error("Error fetching So list:", error);
      return rejectWithValue([]);
    }
  }
);

export const fetchPhongList = createAsyncThunk(
  "school/fetchPhongList",
  async (doetCode: string, { rejectWithValue }) => {
    try {
      const response = await schoolService.fetchPhongList(doetCode);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching Phong list:", error);
      return rejectWithValue([]);
    }
  }
);

export const fetchSchoolList = createAsyncThunk(
  "school/fetchSchoolList",
  async (
    {
      doetCode,
      divisionCode,
      skip = 0,
      take = 50,
    }: {
      doetCode: string | null;
      divisionCode: string | null;
      skip?: number;
      take?: number;
    },
    { getState, rejectWithValue }
  ) => {
    if (!doetCode) return rejectWithValue([]);

    try {
      const response = await schoolService.fetchSchoolList(
        doetCode,
        divisionCode,
        skip,
        take
      );

      const state = getState() as RootState;
      const selectedSchools = state.school.selectedSchool || [];
      const responseData = response.data || [];

      // Filter out schools that are already in response.data
      const uniqueSelectedSchools = selectedSchools.filter(
        (selected: School) =>
          !responseData.some((school) => school.id === selected.id)
      );

      if (skip === 0) {
        return [...uniqueSelectedSchools, ...responseData];
      } else {
        return [...responseData];
      }
    } catch (error) {
      console.error("Error fetching school list:", error);
      if (skip === 0) {
        const state = getState() as RootState;
        return state.school.selectedSchool || [];
      }
      return rejectWithValue([]);
    }
  }
);

export const fetchPartnerList = createAsyncThunk(
  "school/fetchPartnerList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await schoolService.fetchPartnerList();
      return response.data || [];
    } catch (error) {
      console.error("Error fetching partner list:", error);
      return rejectWithValue([]);
    }
  }
);

export const searchSchools = createAsyncThunk(
  "school/searchSchools",
  async (
    {
      doetCode,
      divisionCode,
      keyword,
    }: {
      doetCode: string | null;
      divisionCode: string | null;
      keyword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await schoolService.searchSchools(
        doetCode,
        divisionCode,
        keyword
      );
      return response.data || [];
    } catch (error) {
      console.error("Error searching schools:", error);
      return rejectWithValue([]);
    }
  }
);

// create thunk for debouncedSearch
const debouncedSearchAction = debounce(
  (
    doetCode: string,
    divisionCode: string | null,
    keyword: string,
    dispatch: AppDispatch
  ) => {
    dispatch(searchSchools({ doetCode, divisionCode, keyword }));
  },
  500
);

// create action to trigger debouncedSearch
export const debouncedSearch =
  (doetCode: string, divisionCode: string | null, keyword: string) =>
  (dispatch: AppDispatch) => {
    debouncedSearchAction(doetCode, divisionCode, keyword, dispatch);
  };

export const fetchSchoolOptions = createAsyncThunk(
  "school/fetchSchoolOptions",
  async (
    {
      selectedSo,
      selectedPhong,
      searchValue,
      existingIds,
    }: {
      selectedSo: string;
      selectedPhong: string | null;
      searchValue: string;
      existingIds: Set<string>;
    },
    { rejectWithValue }
  ) => {
    if (!selectedSo) return rejectWithValue([]);

    try {
      const response = await schoolService.searchSchools(
        selectedSo,
        selectedPhong,
        searchValue
      );

      return (response.data || [])
        .filter((school) => !existingIds.has(school.id.toString()))
        .map((school) => ({
          key: `search_${school.id}`,
          value: school.id.toString(),
          label: school.name,
        }));
    } catch (error) {
      console.error("Error fetching school options:", error);
      return rejectWithValue([]);
    }
  }
);

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
    appendSchoolList: (state, action: PayloadAction<School[]>) => {
      state.schoolList = [...state.schoolList, ...action.payload];
    },
    resetSchoolList: (state) => {
      state.schoolList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSoList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSoList.fulfilled, (state, action) => {
        state.soList = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSoList.rejected, (state) => {
        state.soList = [];
        state.isLoading = false;
      })

      .addCase(fetchPhongList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPhongList.fulfilled, (state, action) => {
        state.phongList = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPhongList.rejected, (state) => {
        state.phongList = [];
        state.isLoading = false;
      })

      .addCase(fetchSchoolList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSchoolList.fulfilled, (state, action) => {
        state.schoolList = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSchoolList.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(fetchPartnerList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPartnerList.fulfilled, (state, action) => {
        state.schoolList = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPartnerList.rejected, (state) => {
        state.schoolList = [];
        state.isLoading = false;
      })

      .addCase(searchSchools.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchSchools.fulfilled, (state, action) => {
        state.schoolList = action.payload;
        state.isLoading = false;
      })
      .addCase(searchSchools.rejected, (state) => {
        state.schoolList = [];
        state.isLoading = false;
      });
  },
});

export const {
  setUnitLevel,
  setSelectedSo,
  setSelectedPhong,
  setSelectedSchool,
  appendSchoolList,
  resetSchoolList,
} = schoolSlice.actions;

export default schoolSlice.reducer;
