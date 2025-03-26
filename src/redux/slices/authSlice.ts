"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { message } from "antd";
import { toast } from "react-toastify";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string;
  password: string;
  selectedSchoolId: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  username: "",
  password: "",
  selectedSchoolId: null,
  isLoading: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const { username, password, selectedSchoolId } = state.auth;

    if (!username || !password || !selectedSchoolId) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return rejectWithValue("Missing credentials");
    }

    try {
      const token = await authService.login({
        userName: username,
        password,
        schoolId: parseInt(selectedSchoolId),
      });
      message.success("Đăng nhập thành công");
      return token;
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Đăng nhập thất bại";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
  return null;
});

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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload;
        state.password = "";
        state.isLoading = false;
      })
      .addCase(login.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.password = "";
      });
  },
});

export const { setUsername, setPassword, setSelectedSchoolId } =
  authSlice.actions;

export default authSlice.reducer;
