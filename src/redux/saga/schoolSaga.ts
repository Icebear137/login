import { call, put, takeLatest, debounce } from "redux-saga/effects";
import { schoolService } from "@/services/schoolService";
import {
  fetchSoListRequest,
  fetchSoListSuccess,
  fetchSoListFailure,
  fetchPhongListRequest,
  fetchPhongListSuccess,
  fetchPhongListFailure,
  fetchSchoolListRequest,
  fetchSchoolListSuccess,
  fetchSchoolListFailure,
  fetchPartnerListRequest,
  fetchPartnerListSuccess,
  fetchPartnerListFailure,
  searchSchoolsRequest,
  searchSchoolsSuccess,
  searchSchoolsFailure,
  debouncedSearchRequest,
} from "../slices/schoolSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { School } from "@/types/schema";
import { setSelectedSchoolId } from "../slices/authSlice";
import { RootState } from "../slices/reducer";
import { select } from "redux-saga/effects";

interface ErrorWithMessage {
  message?: string;
}

function* fetchSoListSaga() {
  try {
    const response: { data: School[] } = yield call(schoolService.fetchSoList);
    yield put(fetchSoListSuccess(response.data || []));
  } catch (error: unknown) {
    console.error("Error fetching So list:", error);
    const typedError = error as ErrorWithMessage;
    yield put(
      fetchSoListFailure(typedError.message || "Lỗi khi tải danh sách Sở")
    );
  }
}

function* fetchPhongListSaga(action: PayloadAction<string>) {
  try {
    const doetCode = action.payload;
    const response: { data: School[] } = yield call(
      schoolService.fetchPhongList,
      doetCode
    );
    yield put(fetchPhongListSuccess(response.data || []));
  } catch (error: unknown) {
    console.error("Error fetching Phong list:", error);
    const typedError = error as ErrorWithMessage;
    yield put(
      fetchPhongListFailure(typedError.message || "Lỗi khi tải danh sách Phòng")
    );
  }
}

function* fetchSchoolListSaga(
  action: PayloadAction<{
    doetCode: string | null;
    divisionCode: string | null;
    skip?: number;
    take?: number;
  }>
) {
  try {
    const { doetCode, divisionCode, skip = 0, take = 50 } = action.payload;
    if (!doetCode) return;

    const response: { data: School[] } = yield call(
      schoolService.fetchSchoolList,
      doetCode,
      divisionCode,
      skip,
      take
    );

    yield put(
      fetchSchoolListSuccess({
        schools: response.data || [],
        skip,
        replace: skip === 0,
      })
    );
  } catch (error: unknown) {
    console.error("Error fetching school list:", error);
    const typedError = error as ErrorWithMessage;
    yield put(
      fetchSchoolListFailure(
        typedError.message || "Lỗi khi tải danh sách trường"
      )
    );
  }
}

function* fetchPartnerListSaga() {
  try {
    const response: { data: School[] } = yield call(
      schoolService.fetchPartnerList
    );
    yield put(fetchPartnerListSuccess(response.data || []));
  } catch (error: unknown) {
    console.error("Error fetching partner list:", error);
    const typedError = error as ErrorWithMessage;
    yield put(
      fetchPartnerListFailure(
        typedError.message || "Lỗi khi tải danh sách đối tác"
      )
    );
  }
}

function* searchSchoolsSaga(
  action: PayloadAction<{
    doetCode: string | null;
    divisionCode: string | null;
    keyword: string;
    skip?: number;
  }>
) {
  try {
    const { doetCode, divisionCode, keyword, skip = 0 } = action.payload;
    if (!doetCode) {
      yield put(searchSchoolsSuccess({ schools: [], skip: 0 }));
      return;
    }

    const response: { data: School[] } = yield call(
      schoolService.searchSchools,
      doetCode,
      divisionCode,
      keyword,
      skip
    );

    // Trả về kết quả tìm kiếm kèm theo skip
    yield put(
      searchSchoolsSuccess({
        schools: response.data || [],
        skip,
      })
    );
  } catch (error: unknown) {
    console.error("Error searching schools:", error);
    const typedError = error as ErrorWithMessage;
    yield put(
      searchSchoolsFailure(typedError.message || "Lỗi khi tìm kiếm trường")
    );
  }
}

function* handleUnitLevelChangeSaga(action: PayloadAction<string | undefined>) {
  try {
    const level = action.payload;
    const state: RootState = yield select();

    if (level === "02") {
      yield put(fetchSoListRequest());

      // Sau khi tải danh sách Sở, cập nhật selectedSchoolId nếu có selectedSo
      if (state.school.selectedSo) {
        const soList: School[] = yield select(
          (state: RootState) => state.school.soList
        );
        const selectedSoData = soList.find(
          (s) => s.doetCode === state.school.selectedSo
        );
        if (selectedSoData) {
          yield put(setSelectedSchoolId(selectedSoData.id.toString()));
        }
      }
    }

    if (level === "03") {
      yield put(fetchSoListRequest());
      if (state.school.selectedSo) {
        yield put(fetchPhongListRequest(state.school.selectedSo));

        if (state.school.selectedPhong) {
          const phongList: School[] = yield select(
            (state: RootState) => state.school.phongList
          );
          const selectedPhongData = phongList.find(
            (p) => p.divisionCode === state.school.selectedPhong
          );
          if (selectedPhongData) {
            yield put(setSelectedSchoolId(selectedPhongData.id.toString()));
          }
        }
      }
    }

    if (level === "04") {
      yield put(fetchSoListRequest());
      if (state.school.selectedSo) {
        yield put(fetchPhongListRequest(state.school.selectedSo));
        yield put(
          fetchSchoolListRequest({
            doetCode: state.school.selectedSo,
            divisionCode: null,
            skip: 0,
          })
        );

        const selectedSchool = state.school.selectedSchool?.[0];
        if (selectedSchool) {
          yield put(setSelectedSchoolId(selectedSchool.id.toString()));
        }
      }
    }

    if (level === "05") {
      yield put(fetchPartnerListRequest());
      yield put(setSelectedSchoolId(null));
    }
  } catch (error: unknown) {
    console.error("Error in handleUnitLevelChangeSaga:", error);
  }
}

function* handleSoChangeSaga(action: PayloadAction<string | null>) {
  try {
    const soValue = action.payload;
    const state: RootState = yield select();

    if (soValue) {
      yield put(fetchPhongListRequest(soValue));
      yield put(
        fetchSchoolListRequest({
          doetCode: soValue,
          divisionCode: null,
          skip: 0,
        })
      );

      if (state.school.unitLevel === "02") {
        const soList: School[] = yield select(
          (state: RootState) => state.school.soList
        );
        const selectedSoData = soList.find((s) => s.doetCode === soValue);
        if (selectedSoData) {
          yield put(setSelectedSchoolId(selectedSoData.id.toString()));
        }
      }
    }
  } catch (error: unknown) {
    console.error("Error in handleSoChangeSaga:", error);
  }
}

function* handlePhongChangeSaga(action: PayloadAction<string | null>) {
  try {
    const phongValue = action.payload;
    const state: RootState = yield select();

    if (phongValue && state.school.selectedSo) {
      yield put(
        fetchSchoolListRequest({
          doetCode: state.school.selectedSo,
          divisionCode: phongValue,
          skip: 0,
        })
      );

      if (state.school.unitLevel === "03") {
        const phongList: School[] = yield select(
          (state: RootState) => state.school.phongList
        );
        const selectedPhongData = phongList.find(
          (p) => p.divisionCode === phongValue
        );
        if (selectedPhongData) {
          yield put(setSelectedSchoolId(selectedPhongData.id.toString()));
        }
      }
    }
  } catch (error: unknown) {
    console.error("Error in handlePhongChangeSaga:", error);
  }
}

function* debouncedSearchSaga(
  action: PayloadAction<{
    doetCode: string;
    divisionCode: string | null;
    keyword: string;
  }>
) {
  try {
    const { doetCode, divisionCode, keyword } = action.payload;
    if (keyword === "" || keyword.length >= 2) {
      yield put(
        searchSchoolsRequest({ doetCode, divisionCode, keyword, skip: 0 })
      );
    }
  } catch (error: unknown) {
    console.error("Error in debouncedSearchSaga:", error);
  }
}

export function* watchSchoolSagas() {
  yield takeLatest(fetchSoListRequest.type, fetchSoListSaga);
  yield takeLatest(fetchPhongListRequest.type, fetchPhongListSaga);
  yield takeLatest(fetchSchoolListRequest.type, fetchSchoolListSaga);
  yield takeLatest(fetchPartnerListRequest.type, fetchPartnerListSaga);
  yield takeLatest(searchSchoolsRequest.type, searchSchoolsSaga);
  yield takeLatest("school/setUnitLevel", handleUnitLevelChangeSaga);
  yield takeLatest("school/setSelectedSo", handleSoChangeSaga);
  yield takeLatest("school/setSelectedPhong", handlePhongChangeSaga);
  yield debounce(500, debouncedSearchRequest.type, debouncedSearchSaga);
}
