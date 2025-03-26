import { call, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { schoolService } from "../../services/schoolService";
import { RootState } from "../store";
import {
  fetchSoList,
  fetchPhongList,
  fetchSchoolList,
  fetchPartnerList,
  searchSchools,
  fetchSchoolOptions,
  setSearchKey,
  setIsSearchMode,
  incrementPage,
  setHasMore,
} from "../slices/schoolSlice";
import { School } from "../../types/schema";
import { AnyAction } from "@reduxjs/toolkit";

// Worker Sagas
function* fetchSoListSaga(action: AnyAction): Generator {
  try {
    const response = yield call(schoolService.fetchSoList);
    yield put(
      fetchSoList.fulfilled(response.data || [], action.meta.requestId)
    );
  } catch (error) {
    yield put(fetchSoList.rejected(error, action.meta.requestId, []));
  }
}

function* fetchPhongListSaga(action: AnyAction): Generator {
  try {
    const doetCode = action.payload;
    const response = yield call(schoolService.fetchPhongList, doetCode);
    yield put(
      fetchPhongList.fulfilled(response.data || [], action.meta.requestId)
    );
  } catch (error) {
    yield put(fetchPhongList.rejected(error, action.meta.requestId, []));
  }
}

interface FetchSchoolListPayload {
  doetCode: string | null;
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
      yield put(
        fetchSchoolList.rejected(
          new Error("No doetCode provided"),
          action.meta.requestId,
          []
        )
      );
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

      yield put(
        fetchSchoolList.fulfilled(
          [...uniqueSelectedSchools, ...responseData],
          action.meta.requestId,
          action.payload
        )
      );

      if (responseData.length < take) {
        yield put(setHasMore(false));
      } else {
        yield put(setHasMore(true));
      }
    } else {
      yield put(
        fetchSchoolList.fulfilled(
          response.data || [],
          action.meta.requestId,
          action.payload
        )
      );

      if (response.data?.length < take) {
        yield put(setHasMore(false));
      }
    }

    if (skip > 0) {
      yield put(incrementPage());
    }
  } catch (error) {
    const state = (yield select()) as RootState;
    // Kiểm tra action.payload có tồn tại không và có thuộc tính skip không
    const isFirstPage =
      !action.payload ||
      action.payload.skip === undefined ||
      action.payload.skip === 0;

    if (isFirstPage) {
      yield put(
        fetchSchoolList.fulfilled(
          state.school.selectedSchool || [],
          action.meta.requestId,
          action.payload || {
            doetCode: null,
            divisionCode: null,
            skip: 0,
            take: 50,
          }
        )
      );
      yield put(setHasMore(false));
    } else {
      yield put(fetchSchoolList.rejected(error, action.meta.requestId, []));
    }
  }
}

function* fetchPartnerListSaga(action: AnyAction): Generator {
  try {
    const response = yield call(schoolService.fetchPartnerList);
    yield put(
      fetchPartnerList.fulfilled(response.data || [], action.meta.requestId)
    );
  } catch (error) {
    yield put(fetchPartnerList.rejected(error, action.meta.requestId, []));
  }
}

interface SearchSchoolsPayload {
  doetCode: string | null;
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
      yield put(
        searchSchools.rejected(
          new Error("No doetCode provided"),
          action.meta.requestId,
          []
        )
      );
      return;
    }

    // Lưu lại trạng thái search trước khi gọi API
    // Chỉ lưu trạng thái khi keyword có giá trị và khi là request đầu tiên
    if (skip === 0 && keyword) {
      yield put(setSearchKey(keyword));
      yield put(setIsSearchMode(true));
    }

    // Lấy state hiện tại để có searchKey mới nhất (phòng trường hợp đã bị thay đổi)
    const state = (yield select()) as RootState;
    const currentSearchKey = state.school.searchKey || keyword;

    // Sử dụng searchKey từ state nếu đang trong chế độ search và skip > 0
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

    yield put(
      searchSchools.fulfilled(result, action.meta.requestId, action.payload)
    );

    if (response.data?.length < take) {
      yield put(setHasMore(false));
    } else {
      yield put(setHasMore(true));
    }

    if (skip > 0) {
      yield put(incrementPage());
    }
  } catch (error) {
    // Kiểm tra xem action.payload có tồn tại không
    const isFirstPage =
      !action.payload ||
      action.payload.skip === undefined ||
      action.payload.skip === 0;

    // Trả về dữ liệu rỗng nếu là lỗi
    yield put(searchSchools.rejected(error, action.meta.requestId, []));

    // Đặt hasMore thành false nếu là trang đầu tiên
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
      yield put(
        fetchSchoolOptions.rejected(
          new Error("No selectedSo provided"),
          action.meta.requestId,
          []
        )
      );
      return;
    }

    const response = yield call(
      schoolService.searchSchools,
      selectedSo,
      selectedPhong,
      searchValue
    );

    const result = (response.data || [])
      .filter((school: School) => !existingIds.has(school.id.toString()))
      .map((school: School) => ({
        key: `search_${school.id}`,
        value: school.id.toString(),
        label: school.name,
      }));

    yield put(fetchSchoolOptions.fulfilled(result, action.meta.requestId));
  } catch (error) {
    yield put(fetchSchoolOptions.rejected(error, action.meta.requestId, []));
  }
}

// Watcher Saga
export function* schoolSaga(): Generator {
  yield takeLatest(fetchSoList.pending.type, fetchSoListSaga);
  yield takeLatest(fetchPhongList.pending.type, fetchPhongListSaga);
  yield takeLatest(fetchSchoolList.pending.type, fetchSchoolListSaga);
  yield takeLatest(fetchPartnerList.pending.type, fetchPartnerListSaga);
  yield takeEvery(searchSchools.pending.type, searchSchoolsSaga);
  yield takeLatest(fetchSchoolOptions.pending.type, fetchSchoolOptionsSaga);
}
