import { call, put, select, takeLatest } from "redux-saga/effects";
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
): Generator<any, void, any> {
  try {
    const state: RootState = yield select();
    const { filters, pagination } = state.borrow;
    const page = action.payload.page || pagination.current;
    const pageSize = action.payload.pageSize || pagination.pageSize;
    const skip = (page - 1) * pageSize;

    const params = {
      skip,
      take: pageSize,
      ...(filters.searchKey && { searchKey: filters.searchKey }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.cardType && { cardType: filters.cardType }),
      ...(filters.loanStatus && { loanStatus: filters.loanStatus }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortDirection && { sortDirection: filters.sortDirection }),
    };

    const response = yield call(borrowService.getBorrowRecords, params);

    yield put(
      fetchBorrowRecordsSuccess({
        items: response.items,
        total: response.totalCount,
      })
    );
  } catch (error) {
    yield put(
      fetchBorrowRecordsFailure(
        error instanceof Error ? error.message : "Không thể tải dữ liệu"
      )
    );
  }
}
function* fetchBookBorrowRecordsSaga(
  action: PayloadAction<{ page?: number; pageSize?: number }>
): Generator<any, void, any> {
  try {
    const state: RootState = yield select();
    const { filters, pagination } = state.borrow;
    const page = action.payload.page || pagination.current;
    const pageSize = action.payload.pageSize || pagination.pageSize;
    const skip = (page - 1) * pageSize;

    const obj = {
      skip,
      take: pageSize,
      ...(filters.searchKey && { searchKey: filters.searchKey }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.cardType && { cardType: filters.cardType }),
      ...(filters.loanStatus && { loanStatus: filters.loanStatus }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortDirection && { sortDirection: filters.sortDirection }),
      ...(filters.registrationNumber && {
        registrationNumber: filters.registrationNumber,
      }),
      ...(filters.title && { title: filters.title }),
    };

    const response = yield call(borrowService.getBookRecords, obj);

    yield put(
      fetchBookBorrowRecordsSuccess({
        items: response.items,
        total: response.totalCount,
      })
    );
  } catch (error) {
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
