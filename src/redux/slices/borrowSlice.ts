import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BorrowRecord, BorrowState } from "@/types/schema";

const initialState: BorrowState = {
  records: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 50,
    total: 0,
  },
  filters: {
    searchKey: "",
    fromDate: "",
    toDate: "",
    cardType: undefined,
    loanStatus: undefined,
    isReturn: undefined,
    sortBy: undefined,
    sortDirection: undefined,
    registrationNumber: "",
    title: "",
  },
};

const borrowSlice = createSlice({
  name: "borrow",
  initialState,
  reducers: {
    fetchBorrowRecords: (
      state,
      action: PayloadAction<{ page?: number; pageSize?: number }>
    ) => {
      state.loading = true;
      state.error = null;
      if (action.payload.page) {
        console.log("Updating pagination.current to:", action.payload.page);
        state.pagination.current = action.payload.page;
      }
      if (action.payload.pageSize) {
        console.log(
          "Updating pagination.pageSize to:",
          action.payload.pageSize
        );
        state.pagination.pageSize = action.payload.pageSize;
      }
      console.log("Updated pagination state:", state.pagination);
    },
    fetchBorrowRecordsSuccess: (
      state,
      action: PayloadAction<{ items: BorrowRecord[]; total: number }>
    ) => {
      console.log("Loan success action payload:", action.payload);
      state.loading = false;
      state.records = action.payload.items;
      state.pagination.total = action.payload.total;
      state.error = null;
      console.log("Loan state after update:", {
        records: state.records,
        pagination: state.pagination,
      });
    },
    fetchBorrowRecordsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchBookBorrowRecords: (
      state,
      action: PayloadAction<{ page?: number; pageSize?: number }>
    ) => {
      state.loading = true;
      state.error = null;
      if (action.payload.page) {
        console.log(
          "Updating book pagination.current to:",
          action.payload.page
        );
        state.pagination.current = action.payload.page;
      }
      if (action.payload.pageSize) {
        console.log(
          "Updating book pagination.pageSize to:",
          action.payload.pageSize
        );
        state.pagination.pageSize = action.payload.pageSize;
      }
      console.log("Updated book pagination state:", state.pagination);
    },
    fetchBookBorrowRecordsSuccess: (
      state,
      action: PayloadAction<{ items: BorrowRecord[]; total: number }>
    ) => {
      console.log("Book success action payload:", action.payload);
      state.loading = false;
      state.records = action.payload.items;
      state.pagination.total = action.payload.total;
      state.error = null;
      console.log("Book state after update:", {
        records: state.records,
        pagination: state.pagination,
      });
    },
    fetchBookBorrowRecordsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFilters: (
      state,
      action: PayloadAction<Partial<BorrowState["filters"]>>
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    updatePagination: (
      state,
      action: PayloadAction<Partial<BorrowState["pagination"]>>
    ) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
  },
});

export const {
  fetchBorrowRecords,
  fetchBorrowRecordsSuccess,
  fetchBorrowRecordsFailure,
  fetchBookBorrowRecords,
  fetchBookBorrowRecordsSuccess,
  fetchBookBorrowRecordsFailure,
  updateFilters,
  updatePagination,
} = borrowSlice.actions;

export default borrowSlice.reducer;
