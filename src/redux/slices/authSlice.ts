import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string;
  selectedSchoolId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  username: "",
  selectedSchoolId: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (
      state,
      action: PayloadAction<{
        username: string;
        password: string;
        schoolId: number;
      }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.token = null;
      state.isLoading = false;
      state.error = action.payload;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setSelectedSchoolId: (state, action: PayloadAction<string>) => {
      state.selectedSchoolId = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.username = "";
      state.selectedSchoolId = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  setUsername,
  setSelectedSchoolId,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
