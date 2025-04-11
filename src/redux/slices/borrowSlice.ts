import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BorrowRecord,
  BorrowState,
  LoanDetail,
  BorrowRequest,
} from "@/types/schema";

const initialState: BorrowState = {
  records: [],
  loading: false,
  error: null,
  selectedLoan: null,
  loanCode: null,
  loadingLoanCode: false,
  sendingBorrowRequest: false,
  borrowRequestSuccess: false,
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
        state.pagination.current = action.payload.page;
      }
      if (action.payload.pageSize) {
        state.pagination.pageSize = action.payload.pageSize;
      }
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
      if (action.payload.page) {
        state.pagination.current = action.payload.page;
      }
      if (action.payload.pageSize) {
        state.pagination.pageSize = action.payload.pageSize;
      }
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
    fetchLoanDetailById: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    fetchLoanDetailByIdSuccess: (state, action: PayloadAction<LoanDetail>) => {
      state.loading = false;
      state.selectedLoan = action.payload;
      state.error = null;
    },
    fetchLoanDetailByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.selectedLoan = null;
    },
    clearSelectedLoan: (state) => {
      state.selectedLoan = null;
    },
    fetchStudent: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    fetchStudentSuccess: (state, action: PayloadAction<LoanDetail>) => {
      state.loading = false;
      state.selectedLoan = action.payload;
      state.error = null;
    },
    fetchStudentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.selectedLoan = null;
    },

    // Get loan code
    fetchLoanCode: (state) => {
      state.loadingLoanCode = true;
      state.error = null;
    },
    fetchLoanCodeSuccess: (state, action: PayloadAction<string>) => {
      state.loadingLoanCode = false;
      state.loanCode = action.payload;
      state.error = null;
    },
    fetchLoanCodeFailure: (state, action: PayloadAction<string>) => {
      state.loadingLoanCode = false;
      state.error = action.payload;
    },
    sendBorrowRequest: (state, action: PayloadAction<BorrowRequest>) => {
      state.sendingBorrowRequest = true;
      state.borrowRequestSuccess = false;
      state.error = null;
    },
    sendBorrowRequestSuccess: (state) => {
      state.sendingBorrowRequest = false;
      state.borrowRequestSuccess = true;
      state.error = null;
    },
    sendBorrowRequestFailure: (state, action: PayloadAction<string>) => {
      state.sendingBorrowRequest = false;
      state.borrowRequestSuccess = false;
      state.error = action.payload;
    },
    resetBorrowRequestState: (state) => {
      state.sendingBorrowRequest = false;
      state.borrowRequestSuccess = false;
      state.error = null;
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
  fetchLoanDetailById,
  fetchLoanDetailByIdSuccess,
  fetchLoanDetailByIdFailure,
  clearSelectedLoan,
  fetchStudent,
  fetchStudentSuccess,
  fetchStudentFailure,
  fetchLoanCode,
  fetchLoanCodeSuccess,
  fetchLoanCodeFailure,
  sendBorrowRequest,
  sendBorrowRequestSuccess,
  sendBorrowRequestFailure,
  resetBorrowRequestState,
} = borrowSlice.actions;

export default borrowSlice.reducer;
