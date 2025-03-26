import { all, fork } from "redux-saga/effects";
import { authSaga } from "./authSaga";

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    // Thêm các saga khác ở đây trong tương lai nếu cần
  ]);
}
