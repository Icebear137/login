import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BorrowRecord {
  id: number;
  borrowId: string;
  cardNumber: string;
  name: string;
  class: string;
  type: string;
  borrowDate: string;
  returnDate: string;
  booksCount: number;
  returned: number;
  renewed: number;
}

interface BorrowState {
  records: BorrowRecord[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: {
    searchKey: string;
    fromDate: string;
    toDate: string;
    cardType?: number;
    loanStatus?: number;
    sortBy?: string;
    sortDirection?: string;
    registrationNumber: string;
    title: string;
  };
}

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
    },
    fetchBorrowRecordsSuccess: (
      state,
      action: PayloadAction<{ items: BorrowRecord[]; total: number }>
    ) => {
      state.loading = false;
      state.records = action.payload.items;
      state.pagination.total = action.payload.total;
      state.error = null;
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
    },
    fetchBookBorrowRecordsSuccess: (
      state,
      action: PayloadAction<{ items: BorrowRecord[]; total: number }>
    ) => {
      state.loading = false;
      state.records = action.payload.items;
      state.pagination.total = action.payload.total;
      state.error = null;
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
