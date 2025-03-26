import { call, put, select, takeLatest } from "redux-saga/effects";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import { RootState } from "../store";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutSuccess,
} from "../slices/authSlice";

// Action types
export const LOGIN_REQUEST = "auth/loginRequest";
export const LOGIN_SUCCESS = "auth/loginSuccess";
export const LOGIN_FAILURE = "auth/loginFailure";
export const LOGOUT_REQUEST = "auth/logoutRequest";
export const LOGOUT_SUCCESS = "auth/logoutSuccess";

// Worker Sagas
function* loginSaga(): Generator<any, void, any> {
  try {
    const { auth } = yield select((state: RootState) => state);
    const { username, password, selectedSchoolId } = auth;

    if (!username || !password || !selectedSchoolId) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      yield put(loginFailure("Missing credentials"));
      return;
    }

    const token = yield call(authService.login, {
      userName: username,
      password,
      schoolId: parseInt(selectedSchoolId),
    });

    yield put(loginSuccess(token));
    toast.success("Đăng nhập thành công!");
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Đăng nhập thất bại";
    yield put(loginFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* logoutSaga(): Generator<any, void, any> {
  try {
    yield call(authService.logout);
    yield put(logoutSuccess());
    toast.success("Đăng xuất thành công!");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Đăng xuất không thành công");
  }
}

// Watcher Saga
export function* authSaga(): Generator<any, void, any> {
  yield takeLatest(LOGIN_REQUEST, loginSaga);
  yield takeLatest(LOGOUT_REQUEST, logoutSaga);
}

// Action creator cho logout request
export const logoutRequest = () => ({ type: LOGOUT_REQUEST });
