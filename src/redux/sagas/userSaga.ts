import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchUserInfo,
  fetchUserInfoSuccess,
  fetchUserInfoFailure,
} from "../slices/userSlice";
import apiClient from "@/services/apiClient";

function* fetchUserInfoSaga(): Generator<any, void, any> {
  try {
    const response = yield call(() =>
      apiClient.get("user/get-current-user-info")
    );

    if (response.data && response.data.data) {
      yield put(fetchUserInfoSuccess(response.data.data));
    } else {
      yield put(fetchUserInfoFailure("Failed to fetch user info"));
    }
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Failed to fetch user info";
    yield put(fetchUserInfoFailure(errorMessage));
  }
}

export function* userSaga() {
  yield takeLatest(fetchUserInfo.type, fetchUserInfoSaga);
}
