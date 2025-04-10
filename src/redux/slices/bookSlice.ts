import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookState, BookCatalog } from "@/types/schema";

const initialState: BookState = {
  bookCatalogs: [],
  loading: false,
  error: null,
  pagination: {
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
  updateBookFilters,
  updateBookPagination,
} = bookSlice.actions;

export default bookSlice.reducer;
