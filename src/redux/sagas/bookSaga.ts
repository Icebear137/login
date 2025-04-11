import { call, put, select, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchBookCatalogs,
  fetchBookCatalogsSuccess,
  fetchBookCatalogsFailure,
  fetchBookTypes,
  fetchBookTypesSuccess,
  fetchBookTypesFailure,
  fetchBookRegistrations,
  fetchBookRegistrationsSuccess,
  fetchBookRegistrationsFailure,
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

    const response = yield call(bookService.getBookCatalog, params);

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

function* fetchBookTypesSaga(): Generator<any, void, any> {
  try {
    const response = yield call(bookService.getBookTypes);

    yield put(fetchBookTypesSuccess(response.data));
  } catch (error) {
    console.error("Error fetching book types:", error);
    const errorMessage =
      (error as Error)?.message || "Failed to fetch book types";
    yield put(fetchBookTypesFailure(errorMessage));
  }
}

function* fetchBookRegistrationsSaga(
  action: PayloadAction<{ page?: number; pageSize?: number }>
): Generator<any, void, any> {
  try {
    const state: RootState = yield select();
    const { registrationFilters, registrationPagination } = state.book;

    const params = {
      skip:
        ((registrationPagination.current || 1) - 1) *
        (registrationPagination.pageSize || 10),
      take: registrationPagination.pageSize || 10,
      ...(registrationFilters.bookTypeId && {
        bookTypeId: registrationFilters.bookTypeId,
      }),
      ...(registrationFilters.registrationNumbers !== "" && {
        registrationNumbers: registrationFilters.registrationNumbers,
      }),
      ...(registrationFilters.searchKey !== "" && {
        searchKey: registrationFilters.searchKey,
      }),
    };

    const response = yield call(bookService.getBookRegistrations, params);

    yield put(
      fetchBookRegistrationsSuccess({
        items: response.data,
        total: response.totalCount, // Hardcoded for now, adjust when API provides total count
      })
    );
  } catch (error) {
    console.error("Error fetching book registrations:", error);
    const errorMessage =
      (error as Error)?.message || "Failed to fetch book registrations";
    yield put(fetchBookRegistrationsFailure(errorMessage));
  }
}

export function* bookSaga() {
  yield takeLatest(fetchBookCatalogs.type, fetchBookCatalogsSaga);
  yield takeLatest(fetchBookTypes.type, fetchBookTypesSaga);
  yield takeLatest(fetchBookRegistrations.type, fetchBookRegistrationsSaga);
}
