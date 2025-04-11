import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BookState,
  BookCatalog,
  BookType,
  BookRegistration,
  BookRegistrationParams,
} from "@/types/schema";

const initialState: BookState = {
  bookCatalogs: [],
  bookTypes: [],
  bookRegistrations: [],
  loading: false,
  loadingBookTypes: false,
  loadingBookRegistrations: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  registrationPagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    searchKey: "",
    schoolPublishingCompanyId: null,
    languageId: null,
    bookTypeId: null,
    myBookTypeId: null,
    schoolBookCategoryId: null,
    schoolCategoryId: null,
    fromDate: null,
    toDate: null,
    isGetBookAvailable: true,
  },
  registrationFilters: {
    searchKey: "",
    skip: 0,
    take: 10,
    bookConditionId: null,
    bookStatusId: 1,
  },
};

const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    fetchBookCatalogs: (
      state,
      action: PayloadAction<{ page?: number; pageSize?: number }>
    ) => {
      state.loading = true;
      state.error = null;
      if (action.payload.page) {
        state.pagination.current = action.payload.page;
      }
      if (action.payload.pageSize) {
        state.pagination.pageSize = action.payload.pageSize;
      }
    },
    fetchBookCatalogsSuccess: (
      state,
      action: PayloadAction<{ items: BookCatalog[]; total: number }>
    ) => {
      state.loading = false;
      state.bookCatalogs = action.payload.items;
      state.pagination.total = action.payload.total;
      state.error = null;
    },
    fetchBookCatalogsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchBookTypes: (state) => {
      state.loadingBookTypes = true;
      state.error = null;
    },
    fetchBookTypesSuccess: (state, action: PayloadAction<BookType[]>) => {
      state.loadingBookTypes = false;
      state.bookTypes = action.payload;
      state.error = null;
    },
    fetchBookTypesFailure: (state, action: PayloadAction<string>) => {
      state.loadingBookTypes = false;
      state.error = action.payload;
    },
    fetchBookRegistrations: (
      state,
      action: PayloadAction<{ page?: number; pageSize?: number }>
    ) => {
      state.loadingBookRegistrations = true;
      state.error = null;
      if (action.payload.page) {
        state.registrationPagination.current = action.payload.page;
      }
      if (action.payload.pageSize) {
        state.registrationPagination.pageSize = action.payload.pageSize;
      }
    },
    fetchBookRegistrationsSuccess: (
      state,
      action: PayloadAction<{ items: BookRegistration[]; total: number }>
    ) => {
      state.loadingBookRegistrations = false;
      state.bookRegistrations = action.payload.items;
      state.registrationPagination.total = action.payload.total;
      state.error = null;
    },
    fetchBookRegistrationsFailure: (state, action: PayloadAction<string>) => {
      state.loadingBookRegistrations = false;
      state.error = action.payload;
    },
    updateRegistrationFilters: (
      state,
      action: PayloadAction<Partial<BookRegistrationParams>>
    ) => {
      state.registrationFilters = {
        ...state.registrationFilters,
        ...action.payload,
      };
    },
    updateBookFilters: (
      state,
      action: PayloadAction<Partial<BookState["filters"]>>
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    updateBookPagination: (
      state,
      action: PayloadAction<Partial<BookState["pagination"]>>
    ) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
  },
});

export const {
  fetchBookCatalogs,
  fetchBookCatalogsSuccess,
  fetchBookCatalogsFailure,
  fetchBookTypes,
  fetchBookTypesSuccess,
  fetchBookTypesFailure,
  fetchBookRegistrations,
  fetchBookRegistrationsSuccess,
  fetchBookRegistrationsFailure,
  updateBookFilters,
  updateBookPagination,
  updateRegistrationFilters,
} = bookSlice.actions;

export default bookSlice.reducer;
