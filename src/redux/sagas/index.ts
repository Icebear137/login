import { all } from "redux-saga/effects";
import { authSaga } from "./authSaga";
import { schoolSaga } from "./schoolSaga";
import { borrowSaga } from "./borrowSaga";

export default function* rootSaga() {
  yield all([
    authSaga(),
    schoolSaga(),
    borrowSaga(),
    // Thêm các saga khác ở đây trong tương lai nếu cần
  ]);
}
