import { put, select, takeLatest, call } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchBorrowRecords,
  fetchBorrowRecordsSuccess,
  fetchBorrowRecordsFailure,
  fetchBookBorrowRecords,
  fetchBookBorrowRecordsSuccess,
  fetchBookBorrowRecordsFailure,
  fetchLoanDetailById,
  fetchLoanDetailByIdSuccess,
  fetchLoanDetailByIdFailure,
  fetchLoanCode,
  fetchLoanCodeSuccess,
  fetchLoanCodeFailure,
  sendBorrowRequest,
  sendBorrowRequestSuccess,
  sendBorrowRequestFailure,
} from "../slices/borrowSlice";
import { RootState } from "../store";
import { borrowService } from "@/services/borrowService";
import { BorrowRequest } from "@/types/schema";

function* fetchBorrowRecordsSaga(
  action: PayloadAction<{ page?: number; pageSize?: number }>
) {
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
      ...(filters.loanStatus && {
        loanStatus: filters.loanStatus,
      }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
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
    } catch (apiError) {
      // Handle API error
      yield put(
        fetchBorrowRecordsFailure(
          apiError instanceof Error ? apiError.message : "Không thể tải dữ liệu"
        )
      );
    }
  } catch (error) {
    // Handle saga error
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

    const obj = {
      skip,
      take: pageSize,
      ...(filters.searchKey && { searchKey: filters.searchKey }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
      ...(filters.cardType && { cardType: filters.cardType }),
      ...(filters.isReturn !== null && { isReturn: filters.isReturn }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortDirection !== null && {
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
    } catch (apiError) {
      console.error("API Error:", apiError);
      yield put(
        fetchBookBorrowRecordsFailure(
          apiError instanceof Error ? apiError.message : "Không thể tải dữ liệu"
        )
      );
    }
  } catch (error) {
    // Handle saga error
    yield put(
      fetchBookBorrowRecordsFailure(
        error instanceof Error ? error.message : "Không thể tải dữ liệu"
      )
    );
  }
}

function* fetchLoanDetailByIdSaga(action: PayloadAction<string>) {
  try {
    const loanId = action.payload;
    // @ts-expect-error API call in saga
    const response = yield borrowService.getLoanDetailById(loanId);

    yield put(fetchLoanDetailByIdSuccess(response));
  } catch (error) {
    // Handle saga error
    yield put(
      fetchLoanDetailByIdFailure(
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết phiếu mượn"
      )
    );
  }
}

function* fetchLoanCodeSaga() {
  try {
    // @ts-expect-error API call in saga
    const response = yield call(borrowService.getLoanCode);

    // Trả về data từ response
    // API trả về { code, data, message } và chúng ta chỉ cần data
    const loanCode = response.data;

    yield put(fetchLoanCodeSuccess(loanCode));
  } catch (error) {
    console.error("Error fetching loan code:", error);
    yield put(
      fetchLoanCodeFailure(
        error instanceof Error ? error.message : "Không thể tạo mã phiếu mượn"
      )
    );
  }
}

function* sendBorrowRequestSaga(action: PayloadAction<BorrowRequest>) {
  try {
    // Gọi API để gửi yêu cầu mượn sách
    const response = yield call(
      borrowService.sendBorrowRequest,
      action.payload
    );

    // Kiểm tra response
    if (response && response.code === "1") {
      // Nếu thành công, dispatch action success
      yield put(sendBorrowRequestSuccess());
    } else {
      // Nếu thất bại, dispatch action failure với thông báo lỗi
      yield put(
        sendBorrowRequestFailure(
          response?.message || "Gửi yêu cầu mượn sách thất bại"
        )
      );
    }
  } catch (error) {
    console.error("Error sending borrow request:", error);
    yield put(
      sendBorrowRequestFailure(
        error instanceof Error
          ? error.message
          : "Gửi yêu cầu mượn sách thất bại"
      )
    );
  }
}

export function* borrowSaga() {
  yield takeLatest(fetchBorrowRecords.type, fetchBorrowRecordsSaga);
  yield takeLatest(fetchBookBorrowRecords.type, fetchBookBorrowRecordsSaga);
  yield takeLatest(fetchLoanDetailById.type, fetchLoanDetailByIdSaga);
  yield takeLatest(fetchLoanCode.type, fetchLoanCodeSaga);
  yield takeLatest(sendBorrowRequest.type, sendBorrowRequestSaga);
}
