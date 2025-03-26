import { all, fork } from "redux-saga/effects";
import { authSaga } from "./authSaga";
import { schoolSaga } from "./schoolSaga";

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(schoolSaga),
    // Thêm các saga khác ở đây trong tương lai nếu cần
  ]);
}
