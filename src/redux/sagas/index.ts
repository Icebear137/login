import { all } from "redux-saga/effects";
import { authSaga } from "./authSaga";
import { schoolSaga } from "./schoolSaga";
import { borrowSaga } from "./borrowSaga";
import { studentSaga } from "./studentSaga";
import { bookSaga } from "./bookSaga";
import { userSaga } from "./userSaga";

export default function* rootSaga() {
  yield all([
    authSaga(),
    schoolSaga(),
    borrowSaga(),
    studentSaga(),
    bookSaga(),
    userSaga(),
    // Thêm các saga khác ở đây trong tương lai nếu cần
  ]);
}
