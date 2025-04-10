import { call, put, select, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchStudents,
  fetchStudentsSuccess,
  fetchStudentsFailure,
  fetchStudentById,
  fetchStudentByIdSuccess,
  fetchStudentByIdFailure,
  fetchStudentByCardNumber,
  fetchStudentByCardNumberSuccess,
  fetchStudentByCardNumberFailure,
  fetchGradeCodes,
  fetchGradeCodesSuccess,
  fetchGradeCodesFailure,
  fetchSchoolClasses,
  fetchSchoolClassesSuccess,
  fetchSchoolClassesFailure,
  fetchTeacherGroupSubjects,
  fetchTeacherGroupSubjectsSuccess,
  fetchTeacherGroupSubjectsFailure,
} from "../slices/studentSlice";
import { RootState } from "../store";
import { studentService } from "@/services/studentService";

import { toast } from "react-toastify";

// Worker Sagas
function* fetchStudentsSaga(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _action: PayloadAction<{ page?: number; pageSize?: number }>
): Generator<any, void, any> {
  try {
    const state = yield select((state: RootState) => state.student);
    const { pagination, filters } = state;

    const params = {
      skip: ((pagination.current || 1) - 1) * (pagination.pageSize || 50),
      take: pagination.pageSize || 50,
      searchKey: filters.searchKey || undefined,
      cardTypeId: filters.cardTypeId || undefined,
      cardStatus: filters.cardStatus || undefined,
      sortBy: filters.sortBy || undefined,
      sortDirection: filters.sortDirection || undefined,
      schoolYear: "2024",
      cardNumber: filters.cardNumber || undefined,
      gradeCode: filters.gradeCode || undefined,
      schoolClassId: filters.schoolClassId || undefined,
      isNotExpired:
        filters.isNotExpired !== null ? filters.isNotExpired : undefined,
      teacherGroupSubjectId:
        filters.teacherGroupSubjectId !== null
          ? filters.teacherGroupSubjectId
          : undefined,
    };

    const response = yield call(studentService.getStudentRecords, params);
    // Ensure the response has the expected structure
    const formattedResponse = {
      items: response.data || [],
      total: response.totalCount || 0,
    };

    yield put(fetchStudentsSuccess(formattedResponse));
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Failed to fetch student records";
    yield put(fetchStudentsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* fetchStudentByIdSaga(
  action: PayloadAction<string>
): Generator<any, void, any> {
  try {
    const id = action.payload;
    const response = yield call(studentService.getStudentById, id);
    yield put(fetchStudentByIdSuccess(response));
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Failed to fetch student details";
    yield put(fetchStudentByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* fetchStudentByCardNumberSaga(
  action: PayloadAction<string>
): Generator<any, void, any> {
  try {
    const cardNumber = action.payload;
    const response = yield call(
      studentService.getStudentByCardNumber,
      cardNumber
    );
    yield put(fetchStudentByCardNumberSuccess(response));
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Failed to fetch student by card number";
    yield put(fetchStudentByCardNumberFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Fetch grade codes saga
function* fetchGradeCodesSaga(): Generator<any, void, any> {
  try {
    const response = yield call(studentService.getGradeCodes);
    yield put(fetchGradeCodesSuccess(response));
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Failed to fetch grade codes";
    yield put(fetchGradeCodesFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Fetch school classes saga
function* fetchSchoolClassesSaga(
  action: PayloadAction<string | undefined>
): Generator<any, void, any> {
  try {
    const gradeCode = action.payload;
    const response = yield call(studentService.getSchoolClasses, gradeCode);
    yield put(fetchSchoolClassesSuccess(response.data));
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Failed to fetch school classes";
    yield put(fetchSchoolClassesFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Fetch teacher group subjects saga
function* fetchTeacherGroupSubjectsSaga(): Generator<any, void, any> {
  try {
    const response = yield call(studentService.getTeacherGroupSubjects);
    console.log("Teacher group subjects:", response);
    yield put(fetchTeacherGroupSubjectsSuccess(response.data));
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Failed to fetch teacher group subjects";
    yield put(fetchTeacherGroupSubjectsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Watcher Saga
export function* studentSaga() {
  yield takeLatest(fetchStudents.type, fetchStudentsSaga);
  yield takeLatest(fetchStudentById.type, fetchStudentByIdSaga);
  yield takeLatest(fetchStudentByCardNumber.type, fetchStudentByCardNumberSaga);
  yield takeLatest(fetchGradeCodes.type, fetchGradeCodesSaga);
  yield takeLatest(fetchSchoolClasses.type, fetchSchoolClassesSaga);
  yield takeLatest(
    fetchTeacherGroupSubjects.type,
    fetchTeacherGroupSubjectsSaga
  );
}
