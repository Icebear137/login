import { call, put, takeLatest } from "redux-saga/effects";
import { schoolService } from "../services/schoolService";
import {
  fetchSoListRequest,
  fetchSoListSuccess,
  fetchSoListFailure,
  fetchSchoolListRequest,
  fetchSchoolListSuccess,
  fetchSchoolListFailure,
} from "./schoolSlice";
import { PayloadAction } from "@reduxjs/toolkit";

function* fetchSoListSaga() {
  try {
    const response: { data: any[] } = yield call(schoolService.fetchSoList);
    yield put(fetchSoListSuccess(response.data || []));
  } catch (error: any) {
    yield put(fetchSoListFailure(error.message));
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

    const response: { data: any[] } = yield call(
      schoolService.fetchSchoolList,
      doetCode,
      divisionCode,
      skip,
      take
    );
    yield put(fetchSchoolListSuccess(response.data || []));
  } catch (error: any) {
    yield put(fetchSchoolListFailure(error.message));
  }
}

export function* watchSchoolSagas() {
  yield takeLatest(fetchSoListRequest.type, fetchSoListSaga);
  yield takeLatest(fetchSchoolListRequest.type, fetchSchoolListSaga);
}
```