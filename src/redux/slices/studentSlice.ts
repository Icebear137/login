"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Student,
  StudentState,
  GradeCode,
  SchoolClass,
  TeacherGroupSubject,
} from "@/types/schema";

const initialState: StudentState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 50,
    total: 0,
  },
  filters: {
    searchKey: "",
    cardTypeId: null,
    cardStatus: null,
    teacherGroupSubjectId: null,
    isNotExpired: null,
    cardNumber: "",
    gradeCode: null,
    schoolClassId: null,
  },
  gradeCodes: [],
  schoolClasses: [],
  teacherGroupSubjects: [],
  loadingGradeCodes: false,
  loadingSchoolClasses: false,
  loadingTeacherGroupSubjects: false,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    // Fetch students
    fetchStudents: (
      state,
      action: PayloadAction<{ page?: number; pageSize?: number }>
    ) => {
      state.loading = true;
      state.error = null;
      if (action.payload.page) {
        state.pagination.current = action.payload.page;
      }
      if (action.payload.pageSize) {
        state.pagination.pageSize = action.payload.pageSize;
      }
    },
    fetchStudentsSuccess: (
      state,
      action: PayloadAction<{ items: Student[]; total: number }>
    ) => {
      state.loading = false;
      state.students = action.payload.items;
      state.pagination.total = action.payload.total;
      state.error = null;
    },
    fetchStudentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchStudentById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    fetchStudentByIdSuccess: (state, action: PayloadAction<Student>) => {
      state.loading = false;
      state.selectedStudent = action.payload;
      state.error = null;
    },
    fetchStudentByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch student by card number
    fetchStudentByCardNumber: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchStudentByCardNumberSuccess: (
      state,
      action: PayloadAction<Student>
    ) => {
      state.loading = false;
      state.selectedStudent = action.payload;
      state.error = null;
    },
    fetchStudentByCardNumberFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear student
    clearStudent: (state) => {
      state.selectedStudent = null;
    },

    // Update filters
    updateFilters: (
      state,
      action: PayloadAction<Partial<StudentState["filters"]>>
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // Update pagination
    updatePagination: (
      state,
      action: PayloadAction<Partial<StudentState["pagination"]>>
    ) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },

    // Clear selected student
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },

    // Fetch grade codes
    fetchGradeCodes: (state) => {
      state.loadingGradeCodes = true;
      state.error = null;
    },
    fetchGradeCodesSuccess: (state, action: PayloadAction<GradeCode[]>) => {
      state.loadingGradeCodes = false;
      state.gradeCodes = action.payload;
      state.error = null;
    },
    fetchGradeCodesFailure: (state, action: PayloadAction<string>) => {
      state.loadingGradeCodes = false;
      state.error = action.payload;
    },

    // Fetch school classes
    fetchSchoolClasses: (state, _action: PayloadAction<string | undefined>) => {
      state.loadingSchoolClasses = true;
      state.error = null;
    },
    fetchSchoolClassesSuccess: (
      state,
      action: PayloadAction<SchoolClass[]>
    ) => {
      state.loadingSchoolClasses = false;
      state.schoolClasses = action.payload;
      state.error = null;
    },
    fetchSchoolClassesFailure: (state, action: PayloadAction<string>) => {
      state.loadingSchoolClasses = false;
      state.error = action.payload;
    },

    // Fetch teacher group subjects
    fetchTeacherGroupSubjects: (state) => {
      state.loadingTeacherGroupSubjects = true;
      state.error = null;
    },
    fetchTeacherGroupSubjectsSuccess: (
      state,
      action: PayloadAction<TeacherGroupSubject[]>
    ) => {
      state.loadingTeacherGroupSubjects = false;
      state.teacherGroupSubjects = action.payload;
      state.error = null;
    },
    fetchTeacherGroupSubjectsFailure: (
      state,
      action: PayloadAction<string>
    ) => {
      state.loadingTeacherGroupSubjects = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStudents,
  fetchStudentsSuccess,
  fetchStudentsFailure,
  updateFilters,
  updatePagination,
  clearSelectedStudent,
  fetchStudentById,
  fetchStudentByIdSuccess,
  fetchStudentByIdFailure,
  fetchStudentByCardNumber,
  fetchStudentByCardNumberSuccess,
  fetchStudentByCardNumberFailure,
  clearError,
  clearStudent,
  fetchGradeCodes,
  fetchGradeCodesSuccess,
  fetchGradeCodesFailure,
  fetchSchoolClasses,
  fetchSchoolClassesSuccess,
  fetchSchoolClassesFailure,
  fetchTeacherGroupSubjects,
  fetchTeacherGroupSubjectsSuccess,
  fetchTeacherGroupSubjectsFailure,
} = studentSlice.actions;

export default studentSlice.reducer;
