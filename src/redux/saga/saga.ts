import { all } from "redux-saga/effects";
import { watchAuthSagas, watchLogoutSaga } from "./AuthSaga";
import { watchSchoolSagas } from "./SchoolSaga";

export default function* rootSaga() {
  yield all([watchAuthSagas(), watchLogoutSaga(), watchSchoolSagas()]);
}
