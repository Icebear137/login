import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import { loginRequest, loginSuccess, loginFailure } from "../slices/authSlice";
import { message } from "antd";
import { toast } from "react-toastify";

function* loginSaga(
  action: PayloadAction<{
    username: string;
    password: string;
    schoolId: number;
  }>
) {
  try {
    const { username, password, schoolId } = action.payload;

    if (!username || !password || !schoolId) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      yield put(loginFailure("Vui lòng nhập đầy đủ thông tin đăng nhập"));
      return;
    }

    const token: string = yield call(authService.login, {
      userName: username,
      password,
      schoolId,
    });

    yield put(loginSuccess({ token }));
    message.success("Đăng nhập thành công");
  } catch (error: unknown) {
    console.error("Lỗi đăng nhập:", error);
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };
    const errorMessage =
      errorResponse.response?.data?.message || "Đăng nhập thất bại";
    toast.error(errorMessage);
    yield put(loginFailure(errorMessage));
  }
}

function* logoutSaga() {
  try {
    yield call([authService, authService.logout]);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
  }
}

export function* watchAuthSagas() {
  yield takeLatest(loginRequest.type, loginSaga);
}

export function* watchLogoutSaga() {
  yield takeLatest("auth/logout", logoutSaga);
}
