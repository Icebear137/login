import { call, put, select, takeLatest } from "redux-saga/effects";
import { schoolService } from "../../services/schoolService";
import { RootState } from "../store";
import {
  FETCH_SO_LIST_REQUEST,
  FETCH_SO_LIST_SUCCESS,
  FETCH_SO_LIST_FAILURE,
  FETCH_PHONG_LIST_REQUEST,
  FETCH_PHONG_LIST_SUCCESS,
  FETCH_PHONG_LIST_FAILURE,
  FETCH_SCHOOL_LIST_REQUEST,
  FETCH_SCHOOL_LIST_SUCCESS,
  FETCH_SCHOOL_LIST_FAILURE,
  FETCH_PARTNER_LIST_REQUEST,
  FETCH_PARTNER_LIST_SUCCESS,
  FETCH_PARTNER_LIST_FAILURE,
  SEARCH_SCHOOLS_REQUEST,
  SEARCH_SCHOOLS_SUCCESS,
  SEARCH_SCHOOLS_FAILURE,
  FETCH_SCHOOL_OPTIONS_REQUEST,
  FETCH_SCHOOL_OPTIONS_SUCCESS,
  FETCH_SCHOOL_OPTIONS_FAILURE,
  setSearchKey,
  setIsSearchMode,
  incrementPage,
  setHasMore,
} from "../slices/schoolSlice";
import { School } from "../../types/schema";
import { AnyAction } from "@reduxjs/toolkit";

// Worker Sagas
function* fetchSoListSaga(): Generator {
  try {
    const response = yield call(schoolService.fetchSoList);
    yield put({ type: FETCH_SO_LIST_SUCCESS, payload: response.data || [] });
  } catch (error) {
    yield put({ type: FETCH_SO_LIST_FAILURE, payload: error });
  }
}

function* fetchPhongListSaga(action: AnyAction): Generator {
  try {
    const doetCode = action.payload;
    const response = yield call(schoolService.fetchPhongList, doetCode);
    yield put({ type: FETCH_PHONG_LIST_SUCCESS, payload: response.data || [] });
  } catch (error) {
    yield put({ type: FETCH_PHONG_LIST_FAILURE, payload: error });
  }
}

interface FetchSchoolListPayload {
  doetCode: string;
  divisionCode: string | null;
  skip?: number;
  take?: number;
}

function* fetchSchoolListSaga(action: AnyAction): Generator {
  try {
    const {
      doetCode,
      divisionCode,
      skip = 0,
      take = 50,
    } = action.payload as FetchSchoolListPayload;

    if (!doetCode) {
      yield put({
        type: FETCH_SCHOOL_LIST_FAILURE,
        payload: new Error("No doetCode provided"),
      });
      return;
    }

    const response = yield call(
      schoolService.fetchSchoolList,
      doetCode,
      divisionCode,
      skip,
      take
    );

    const state = (yield select()) as RootState;

    if (skip === 0) {
      const selectedSchools = state.school.selectedSchool || [];
      const responseData = response.data || [];

      // Filter out schools that are already in response.data
      const uniqueSelectedSchools = selectedSchools.filter(
        (selected: School) =>
          !responseData.some((school: School) => school.id === selected.id)
      );

      yield put({
        type: FETCH_SCHOOL_LIST_SUCCESS,
        payload: [...uniqueSelectedSchools, ...responseData],
      });

      if (responseData.length < take) {
        yield put(setHasMore(false));
      } else {
        yield put(setHasMore(true));
      }
    } else {
      yield put({
        type: FETCH_SCHOOL_LIST_SUCCESS,
        payload: response.data || [],
      });

      if (response.data?.length < take) {
        yield put(setHasMore(false));
      }
    }

    if (skip > 0) {
      yield put(incrementPage());
    }
  } catch (error) {
    const state = (yield select()) as RootState;
    const isFirstPage =
      !action.payload ||
      action.payload.skip === undefined ||
      action.payload.skip === 0;

    if (isFirstPage) {
      yield put({
        type: FETCH_SCHOOL_LIST_SUCCESS,
        payload: state.school.selectedSchool || [],
      });
      yield put(setHasMore(false));
    } else {
      yield put({ type: FETCH_SCHOOL_LIST_FAILURE, payload: error });
    }
  }
}

function* fetchPartnerListSaga(): Generator {
  try {
    const response = yield call(schoolService.fetchPartnerList);
    yield put({
      type: FETCH_PARTNER_LIST_SUCCESS,
      payload: response.data || [],
    });
  } catch (error) {
    yield put({ type: FETCH_PARTNER_LIST_FAILURE, payload: error });
  }
}

interface SearchSchoolsPayload {
  doetCode: string;
  divisionCode: string | null;
  keyword: string;
  skip?: number;
  take?: number;
}

function* searchSchoolsSaga(action: AnyAction): Generator {
  try {
    const {
      doetCode,
      divisionCode,
      keyword,
      skip = 0,
      take = 50,
    } = action.payload as SearchSchoolsPayload;

    if (!doetCode) {
      yield put({
        type: SEARCH_SCHOOLS_FAILURE,
        payload: new Error("No doetCode provided"),
      });
      return;
    }

    // Lưu lại trạng thái search trước khi gọi API
    if (skip === 0 && keyword) {
      yield put(setSearchKey(keyword));
      yield put(setIsSearchMode(true));
    }

    const state = (yield select()) as RootState;
    const currentSearchKey = state.school.searchKey || keyword;
    const searchKeyToUse =
      state.school.isSearchMode && skip > 0 ? currentSearchKey : keyword;

    const response = yield call(
      schoolService.searchSchools,
      doetCode,
      divisionCode,
      searchKeyToUse,
      skip,
      take
    );

    let result;
    if (skip === 0) {
      result = response.data || [];
    } else {
      result = [...state.school.schoolList, ...(response.data || [])];
    }

    yield put({ type: SEARCH_SCHOOLS_SUCCESS, payload: result });

    if (response.data?.length < take) {
      yield put(setHasMore(false));
    } else {
      yield put(setHasMore(true));
    }

    if (skip > 0) {
      yield put(incrementPage());
    }
  } catch (error) {
    const isFirstPage =
      !action.payload ||
      action.payload.skip === undefined ||
      action.payload.skip === 0;

    yield put({ type: SEARCH_SCHOOLS_FAILURE, payload: error });

    if (isFirstPage) {
      yield put(setHasMore(false));
    }
  }
}

interface FetchSchoolOptionsPayload {
  selectedSo: string;
  selectedPhong: string | null;
  searchValue: string;
  existingIds: Set<string>;
}

function* fetchSchoolOptionsSaga(action: AnyAction): Generator {
  try {
    const { selectedSo, selectedPhong, searchValue, existingIds } =
      action.payload as FetchSchoolOptionsPayload;

    if (!selectedSo) {
      yield put({
        type: FETCH_SCHOOL_OPTIONS_FAILURE,
        payload: new Error("No selectedSo provided"),
      });
      return;
    }

    const response = yield call(
      schoolService.searchSchools,
      selectedSo,
      selectedPhong,
      searchValue
    );

    const options = (response.data || [])
      .filter((school: School) => !existingIds.has(school.id.toString()))
      .map((school: School) => ({
        key: `search_${school.id}`,
        value: school.id.toString(),
        label: school.name,
      }));

    yield put({ type: FETCH_SCHOOL_OPTIONS_SUCCESS, payload: options });
  } catch (error) {
    yield put({ type: FETCH_SCHOOL_OPTIONS_FAILURE, payload: error });
  }
}

// Watcher Sagas
export function* schoolSaga(): Generator {
  yield takeLatest(FETCH_SO_LIST_REQUEST, fetchSoListSaga);
  yield takeLatest(FETCH_PHONG_LIST_REQUEST, fetchPhongListSaga);
  yield takeLatest(FETCH_SCHOOL_LIST_REQUEST, fetchSchoolListSaga);
  yield takeLatest(FETCH_PARTNER_LIST_REQUEST, fetchPartnerListSaga);
  yield takeLatest(SEARCH_SCHOOLS_REQUEST, searchSchoolsSaga);
  yield takeLatest(FETCH_SCHOOL_OPTIONS_REQUEST, fetchSchoolOptionsSaga);
}
