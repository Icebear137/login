"use client";

import { createSlice, createAction, PayloadAction } from "@reduxjs/toolkit";
import { School } from "../../types/schema";
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
  searchKey: string;
  currentPage: number;
  hasMore: boolean;
  isSearchMode: boolean;
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
  searchKey: "",
  currentPage: 0,
  hasMore: true,
  isSearchMode: false,
};

// Action Types
export const FETCH_SO_LIST_REQUEST = "school/fetchSoListRequest";
export const FETCH_SO_LIST_SUCCESS = "school/fetchSoListSuccess";
export const FETCH_SO_LIST_FAILURE = "school/fetchSoListFailure";

export const FETCH_PHONG_LIST_REQUEST = "school/fetchPhongListRequest";
export const FETCH_PHONG_LIST_SUCCESS = "school/fetchPhongListSuccess";
export const FETCH_PHONG_LIST_FAILURE = "school/fetchPhongListFailure";

export const FETCH_SCHOOL_LIST_REQUEST = "school/fetchSchoolListRequest";
export const FETCH_SCHOOL_LIST_SUCCESS = "school/fetchSchoolListSuccess";
export const FETCH_SCHOOL_LIST_FAILURE = "school/fetchSchoolListFailure";

export const FETCH_PARTNER_LIST_REQUEST = "school/fetchPartnerListRequest";
export const FETCH_PARTNER_LIST_SUCCESS = "school/fetchPartnerListSuccess";
export const FETCH_PARTNER_LIST_FAILURE = "school/fetchPartnerListFailure";

export const SEARCH_SCHOOLS_REQUEST = "school/searchSchoolsRequest";
export const SEARCH_SCHOOLS_SUCCESS = "school/searchSchoolsSuccess";
export const SEARCH_SCHOOLS_FAILURE = "school/searchSchoolsFailure";

export const FETCH_SCHOOL_OPTIONS_REQUEST = "school/fetchSchoolOptionsRequest";
export const FETCH_SCHOOL_OPTIONS_SUCCESS = "school/fetchSchoolOptionsSuccess";
export const FETCH_SCHOOL_OPTIONS_FAILURE = "school/fetchSchoolOptionsFailure";

// Action Creators
export const fetchSoListRequest = createAction(FETCH_SO_LIST_REQUEST);
export const fetchSoListSuccess = createAction<School[]>(FETCH_SO_LIST_SUCCESS);
export const fetchSoListFailure = createAction<Error>(FETCH_SO_LIST_FAILURE);

export const fetchPhongListRequest = createAction<string | null>(
  FETCH_PHONG_LIST_REQUEST
);
export const fetchPhongListSuccess = createAction<School[]>(
  FETCH_PHONG_LIST_SUCCESS
);
export const fetchPhongListFailure = createAction<Error>(
  FETCH_PHONG_LIST_FAILURE
);

export const fetchSchoolListRequest = createAction<{
  doetCode: string | null;
  divisionCode: string | null;
  skip?: number;
  take?: number;
}>(FETCH_SCHOOL_LIST_REQUEST);
export const fetchSchoolListSuccess = createAction<School[]>(
  FETCH_SCHOOL_LIST_SUCCESS
);
export const fetchSchoolListFailure = createAction<Error>(
  FETCH_SCHOOL_LIST_FAILURE
);

export const fetchPartnerListRequest = createAction(FETCH_PARTNER_LIST_REQUEST);
export const fetchPartnerListSuccess = createAction<School[]>(
  FETCH_PARTNER_LIST_SUCCESS
);
export const fetchPartnerListFailure = createAction<Error>(
  FETCH_PARTNER_LIST_FAILURE
);

export const searchSchoolsRequest = createAction<{
  doetCode: string | null;
  divisionCode: string | null;
  keyword: string;
  skip?: number;
  take?: number;
}>(SEARCH_SCHOOLS_REQUEST);
export const searchSchoolsSuccess = createAction<School[]>(
  SEARCH_SCHOOLS_SUCCESS
);
export const searchSchoolsFailure = createAction<Error>(SEARCH_SCHOOLS_FAILURE);

export const fetchSchoolOptionsRequest = createAction<{
  selectedSo: string;
  selectedPhong: string | null;
  searchValue: string;
  existingIds: Set<string>;
}>(FETCH_SCHOOL_OPTIONS_REQUEST);
export const fetchSchoolOptionsSuccess = createAction<School[]>(
  FETCH_SCHOOL_OPTIONS_SUCCESS
);
export const fetchSchoolOptionsFailure = createAction<Error>(
  FETCH_SCHOOL_OPTIONS_FAILURE
);

// create thunk for debouncedSearch
const debouncedSearchAction = debounce(
  (
    doetCode: string,
    divisionCode: string | null,
    keyword: string,
    dispatch: AppDispatch
  ) => {
    dispatch(searchSchoolsRequest({ doetCode, divisionCode, keyword }));
  },
  500
);

// create action to trigger debouncedSearch
export const debouncedSearch =
  (doetCode: string, divisionCode: string | null, keyword: string) =>
  (dispatch: AppDispatch) => {
    debouncedSearchAction(doetCode, divisionCode, keyword, dispatch);
  };

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {
    setUnitLevel: (state, action: PayloadAction<string | undefined>) => {
      state.unitLevel = action.payload;
      state.schoolList = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.searchKey = "";
      state.isSearchMode = false;
    },
    setSelectedSo: (state, action: PayloadAction<string | null>) => {
      state.selectedSo = action.payload;
      state.selectedPhong = null;
      state.schoolList = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.searchKey = "";
      state.isSearchMode = false;
    },
    setSelectedPhong: (state, action: PayloadAction<string | null>) => {
      state.selectedPhong = action.payload;
      state.schoolList = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.searchKey = "";
      state.isSearchMode = false;
    },
    setSelectedSchool: (state, action: PayloadAction<School[]>) => {
      state.selectedSchool = action.payload;
    },
    appendSchoolList: (state, action: PayloadAction<School[]>) => {
      state.schoolList = [...state.schoolList, ...action.payload];
      state.currentPage += 1;
      state.hasMore = action.payload.length > 0;
    },
    resetSchoolList: (state) => {
      state.schoolList = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.searchKey = "";
      state.isSearchMode = false;
    },
    setSearchKey: (state, action: PayloadAction<string>) => {
      state.searchKey = action.payload;
    },
    setIsSearchMode: (state, action: PayloadAction<boolean>) => {
      state.isSearchMode = action.payload;
      // Chỉ xóa searchKey khi chuyển từ search mode sang không search
      if (!action.payload) {
        state.searchKey = "";
      }
    },
    incrementPage: (state) => {
      state.currentPage += 1;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch So List
      .addCase(fetchSoListRequest, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSoListSuccess, (state, action) => {
        state.isLoading = false;
        state.soList = action.payload;
      })
      .addCase(fetchSoListFailure, (state) => {
        state.isLoading = false;
        state.soList = [];
      })
      // Fetch Phong List
      .addCase(fetchPhongListRequest, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPhongListSuccess, (state, action) => {
        state.isLoading = false;
        state.phongList = action.payload;
      })
      .addCase(fetchPhongListFailure, (state) => {
        state.isLoading = false;
        state.phongList = [];
      })
      // Fetch School List
      .addCase(fetchSchoolListRequest, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSchoolListSuccess, (state, action) => {
        state.isLoading = false;
        state.schoolList = action.payload;
      })
      .addCase(fetchSchoolListFailure, (state) => {
        state.isLoading = false;
        state.schoolList = [];
      })
      // Fetch Partner List
      .addCase(fetchPartnerListRequest, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPartnerListSuccess, (state, action) => {
        state.isLoading = false;
        state.schoolList = action.payload;
      })
      .addCase(fetchPartnerListFailure, (state) => {
        state.isLoading = false;
        state.schoolList = [];
      })
      // Search Schools
      .addCase(searchSchoolsRequest, (state) => {
        state.isLoading = true;
      })
      .addCase(searchSchoolsSuccess, (state, action) => {
        state.isLoading = false;
        if (state.currentPage === 0) {
          state.schoolList = action.payload;
        } else {
          state.schoolList = [...state.schoolList, ...action.payload];
        }
        state.currentPage += 1;
        state.hasMore = action.payload.length === 50;
      })
      .addCase(searchSchoolsFailure, (state) => {
        state.isLoading = false;
        state.schoolList = [];
        state.hasMore = false;
      })
      // Fetch School Options
      .addCase(fetchSchoolOptionsRequest, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSchoolOptionsSuccess, (state, action) => {
        state.isLoading = false;
        state.schoolList = action.payload;
      })
      .addCase(fetchSchoolOptionsFailure, (state) => {
        state.isLoading = false;
        state.schoolList = [];
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
  setSearchKey,
  setIsSearchMode,
  incrementPage,
  setHasMore,
} = schoolSlice.actions;

export default schoolSlice.reducer;
