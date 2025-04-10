import { call, put, select, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchBookCatalogs,
  fetchBookCatalogsSuccess,
  fetchBookCatalogsFailure,
} from "../slices/bookSlice";
import { RootState } from "../store";
import { bookService } from "@/services/bookService";

function* fetchBookCatalogsSaga(
  action: PayloadAction<{ page?: number; pageSize?: number }>
): Generator<any, void, any> {
  try {
    const state: RootState = yield select();
    const { filters, pagination } = state.book;

    const params = {
      skip: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
      take: pagination.pageSize || 10,
      searchKey: filters.searchKey || undefined,
      schoolPublishingCompanyId: filters.schoolPublishingCompanyId || undefined,
      languageId: filters.languageId || undefined,
      bookTypeId: filters.bookTypeId || undefined,
      myBookTypeId: filters.myBookTypeId || undefined,
      schoolBookCategoryId: filters.schoolBookCategoryId || undefined,
      schoolCategoryId: filters.schoolCategoryId || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      isGetBookAvailable:
        filters.isGetBookAvailable !== null
          ? filters.isGetBookAvailable
          : undefined,
    };

    console.log("Fetching book catalogs with params:", params);
    const response = yield call(bookService.getBookCatalog, params);
    console.log("Book catalogs response:", response);

    // Assuming the API returns an array of book catalogs
    // If the API returns an object with items and total, adjust accordingly
    yield put(
      fetchBookCatalogsSuccess({
        items: response.data,
        total: response.totalCount, // Adjust if API provides total count
      })
    );
  } catch (error) {
    console.error("Error fetching book catalogs:", error);
    const errorMessage =
      (error as Error)?.message || "Failed to fetch book catalogs";
    yield put(fetchBookCatalogsFailure(errorMessage));
  }
}

export function* bookSaga() {
  yield takeLatest(fetchBookCatalogs.type, fetchBookCatalogsSaga);
}
