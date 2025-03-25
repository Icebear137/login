import { all } from "redux-saga/effects";
import { watchAuthSagas, watchLogoutSaga } from "./authSaga";
import { watchSchoolSagas } from "./schoolSaga";

export default function* rootSaga() {
  yield all([watchAuthSagas(), watchLogoutSaga(), watchSchoolSagas()]);
}
