"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string;
  password: string;
  selectedSchoolId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize state with values from localStorage if available
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  username: "",
  password: "",
  selectedSchoolId:
    typeof window !== "undefined"
      ? localStorage.getItem("selectedSchoolId")
      : null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setSelectedSchoolId: (state, action: PayloadAction<string>) => {
      state.selectedSchoolId = action.payload;
      // Save to localStorage
      localStorage.setItem("selectedSchoolId", action.payload);
    },
    // Reducer cho các action của saga
    loginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.token = action.payload;
      state.password = "";
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.token = null;
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.password = "";
    },
  },
  // Redux-saga sẽ xử lý các side effect,
  // nên chúng ta có thể bỏ extraReducers
});

export const {
  setUsername,
  setPassword,
  setSelectedSchoolId,
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
