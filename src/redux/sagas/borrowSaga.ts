import { put, select, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchBorrowRecords,
  fetchBorrowRecordsSuccess,
  fetchBorrowRecordsFailure,
  fetchBookBorrowRecords,
  fetchBookBorrowRecordsSuccess,
  fetchBookBorrowRecordsFailure,
} from "../slices/borrowSlice";
import { RootState } from "../store";
import { borrowService } from "@/services/borrowService";

function* fetchBorrowRecordsSaga(
  action: PayloadAction<{ page?: number; pageSize?: number }>
) {
  try {
    const state: RootState = yield select();
    const { filters, pagination } = state.borrow;
    const page = action.payload.page || pagination.current;
    const pageSize = action.payload.pageSize || pagination.pageSize;
    const skip = (page - 1) * pageSize;

    console.log(
      `Saga: Fetching page ${page}, pageSize ${pageSize}, skip ${skip}`
    );
    console.log(`Saga: Current pagination state:`, pagination);

    const params = {
      skip,
      take: pageSize,
      ...(filters.searchKey && { searchKey: filters.searchKey }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.cardType !== undefined && { cardType: filters.cardType }),
      ...(filters.loanStatus !== undefined && {
        loanStatus: filters.loanStatus,
      }),
      ...(filters.sortBy !== undefined && { sortBy: filters.sortBy }),
      ...(filters.sortDirection !== undefined && {
        sortDirection: filters.sortDirection,
      }),
    };

    try {
      // @ts-expect-error API call in saga
      const response = yield borrowService.getBorrowRecords(params);

      yield put(
        fetchBorrowRecordsSuccess({
          items: response.data,
          total: response.totalCount,
        })
      );

      console.log(`Loan records fetched successfully for page ${page}`);
    } catch (apiError) {
      console.error("API Error:", apiError);
      yield put(
        fetchBorrowRecordsFailure(
          apiError instanceof Error ? apiError.message : "Không thể tải dữ liệu"
        )
      );
    }
  } catch (error) {
    console.error("Saga Error:", error);
    yield put(
      fetchBorrowRecordsFailure(
        error instanceof Error ? error.message : "Không thể tải dữ liệu"
      )
    );
  }
}
function* fetchBookBorrowRecordsSaga(
  action: PayloadAction<{ page?: number; pageSize?: number }>
) {
  try {
    const state: RootState = yield select();
    const { filters, pagination } = state.borrow;
    const page = action.payload.page || pagination.current;
    const pageSize = action.payload.pageSize || pagination.pageSize;
    const skip = (page - 1) * pageSize;

    console.log(
      `Saga: Fetching book page ${page}, pageSize ${pageSize}, skip ${skip}`
    );
    console.log(`Saga: Current book pagination state:`, pagination);

    const obj = {
      skip,
      take: pageSize,
      ...(filters.searchKey && { searchKey: filters.searchKey }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.cardType !== undefined && { cardType: filters.cardType }),
      ...(filters.isReturn !== undefined && { isReturn: filters.isReturn }),
      ...(filters.sortBy !== undefined && { sortBy: filters.sortBy }),
      ...(filters.sortDirection !== undefined && {
        sortDirection: filters.sortDirection,
      }),
      ...(filters.registrationNumber && {
        registrationNumber: filters.registrationNumber,
      }),
      ...(filters.title && { title: filters.title }),
    };

    try {
      // @ts-expect-error API call in saga
      const response = yield borrowService.getBookRecords(obj);

      yield put(
        fetchBookBorrowRecordsSuccess({
          items: response.data || [],
          total: response.totalCount || 0,
        })
      );

      console.log(`Book records fetched successfully for page ${page}`);
    } catch (apiError) {
      console.error("API Error:", apiError);
      yield put(
        fetchBookBorrowRecordsFailure(
          apiError instanceof Error ? apiError.message : "Không thể tải dữ liệu"
        )
      );
    }
  } catch (error) {
    console.error("Saga Error:", error);
    yield put(
      fetchBookBorrowRecordsFailure(
        error instanceof Error ? error.message : "Không thể tải dữ liệu"
      )
    );
  }
}

export function* borrowSaga() {
  yield takeLatest(fetchBorrowRecords.type, fetchBorrowRecordsSaga);
  yield takeLatest(fetchBookBorrowRecords.type, fetchBookBorrowRecordsSaga);
}
